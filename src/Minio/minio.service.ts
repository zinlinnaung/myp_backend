import { BadRequestException, Injectable } from '@nestjs/common';
import AdmZip = require('adm-zip');
import { randomBytes } from 'crypto';
import { Client } from 'minio';
import * as path from 'path';
import * as unzipper from 'unzipper'; // <-- ADD THIS IMPORT
// Helper interface for bulk uploads
export interface BufferedFile {
  buffer: Buffer;
  fileName: string;
}

@Injectable()
export class MinioService {
  private readonly bucketName = 'dev';

  // NOTE: In production, move these sensitive values to environment variables (.env)
  private readonly client = new Client({
    endPoint: 'mmyouth-minio.bitmyanmar.info',
    port: 443,
    useSSL: true,
    accessKey: 'minio',
    secretKey: '1XUKd8CCtASzGvtn',
  });

  // Temporary memory-store (replace with Redis for production)
  private tempKeys = new Map<string, any>();

  /**
   * 1. NEW: Upload a single file specifically to dev/public/{folder}
   * Returns: The public URL
   */
  async uploadPublicFile(
    fileBuffer: Buffer,
    fileName: string,
    folderName: string,
  ): Promise<string> {
    // Reuse existing logic with isPublic = true
    return this.uploadImage(fileBuffer, fileName, folderName, true);
  }

  /**
   * 2. NEW: Upload multiple files (a folder's content) to dev/public/{folder}
   * Returns: Array of public URLs
   */
  async uploadPublicFolder(
    files: BufferedFile[],
    folderName: string,
  ): Promise<string[]> {
    // Execute all uploads in parallel
    const uploadPromises = files.map((file) =>
      this.uploadPublicFile(file.buffer, file.fileName, folderName),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Existing generic upload method
   */
  async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
    isPublic: boolean,
  ): Promise<string> {
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) await this.client.makeBucket(this.bucketName);

    const baseFolder = isPublic ? 'public' : 'private';
    const objectName = `${baseFolder}/${folder}/${fileName}`;

    // Simple Content-Type detection
    let contentType = 'application/octet-stream';
    if (fileName.endsWith('.png')) contentType = 'image/png';
    else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg'))
      contentType = 'image/jpeg';
    else if (fileName.endsWith('.pdf')) contentType = 'application/pdf';

    await this.client.putObject(
      this.bucketName,
      objectName,
      fileBuffer,
      fileBuffer.length,
      { 'Content-Type': contentType },
    );

    if (isPublic) {
      return `https://mmyouth-minio.bitmyanmar.info/${this.bucketName}/${objectName}`;
    }

    return this.client.presignedGetObject(
      this.bucketName,
      objectName,
      24 * 60 * 60,
    );
  }

  // ... [Keep the rest of your existing methods: uploadImagePrivate, getObjectStream, etc.] ...

  async uploadImagePrivate(
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
  ) {
    // ... existing implementation ...
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) await this.client.makeBucket(this.bucketName);

    const objectName = `private/${folder}/${fileName}`;
    await this.client.putObject(
      this.bucketName,
      objectName,
      fileBuffer,
      fileBuffer.length,
    );

    const token = randomBytes(32).toString('hex');
    const expiresIn = 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + expiresIn;

    this.tempKeys.set(token, { token, objectName, expiresAt });

    const baseUrl = 'https://mmyouth-minio.bitmyanmar.info';
    const encodedPath = encodeURIComponent(objectName);
    const url = `/files/download?path=${encodedPath}&key=${token}`;

    return {
      path: objectName,
      url,
      fullUrl: `${baseUrl}${url}`,
      key: token,
      expiresAt,
    };
  }

  async getObjectStream(objectName: string) {
    return this.client.getObject(this.bucketName, objectName);
  }

  async validateTempKey(token: string) {
    return this.tempKeys.get(token) || null;
  }

  async getSignedUrl(objectName: string) {
    return this.client.presignedGetObject(this.bucketName, objectName, 60);
  }

  async uploadH5P(fileBuffer: Buffer, fileName: string, activityId: string) {
    const timestamp = Date.now();
    const uniqueId = `${activityId}_${timestamp}`;

    // Path for the single H5P file
    const originalH5PPath = `private/h5p/h5p/${uniqueId}.h5p`;

    try {
      // 1️⃣ Upload original H5P file ONLY
      await this.client.putObject(
        this.bucketName,
        originalH5PPath,
        fileBuffer,
        fileBuffer.length,
        // H5P files are ZIP archives, so 'application/zip' or 'application/x-h5p' is appropriate
        { 'Content-Type': 'application/zip' },
      );

      // Return only the path to the file
      return {
        originalPath: originalH5PPath,
        timestamp,
      };
    } catch (error: any) {
      // Full logging for MinIO errors
      console.error('---- FULL MINIO ERROR ----');
      console.error({
        code: error.code,
        message: error.message,
        bucketName: error.bucketName,
        stack: error.stack,
      });
      console.error('---------------------------');

      throw new BadRequestException(
        'Failed to upload H5P file. Check server logs for details.',
      );
    }
  }

  // ... [Keep your existing uploadPublicFile, uploadPublicFolder, uploadImage methods] ...

  /**
   * UPDATED: Uploads the raw .h5p file AND extracts its contents to MinIO
   * * Structure:
   * 1. Original File: private/h5p/originals/{uniqueId}.h5p
   * 2. Extracted Content: public/h5p/content/{uniqueId}/...
   */
  async uploadH5PExtract(
    fileBuffer: Buffer,
    fileName: string,
    activityId: string,
  ) {
    console.log(`[H5P Diagnostic] Buffer Size: ${fileBuffer.length} bytes`);
    const timestamp = Date.now();
    const uniqueId = `${activityId}_${timestamp}`;

    // Paths
    const originalH5PPath = `private/h5p/originals/${uniqueId}.h5p`;
    const extractedBasePath = `public/h5p/content/${uniqueId}`; // Making content public for the player

    // try {
    // 1. Upload the Original .h5p File (Archive)
    await this.client.putObject(
      this.bucketName,
      originalH5PPath,
      fileBuffer,
      fileBuffer.length,
      { 'Content-Type': 'application/zip' },
    );

    // 2. Extract and Upload Contents
    await this.extractAndUploadZip(fileBuffer, extractedBasePath);

    const baseUrl = 'https://mmyouth-minio.bitmyanmar.info';

    return {
      uniqueId,
      originalPath: originalH5PPath,
      extractedBasePath: extractedBasePath,
      // This is usually the path the H5P player needs to load
      playerUrl: `${baseUrl}/${this.bucketName}/${extractedBasePath}`,
      timestamp,
    };
    // } catch (error: any) {
    //   console.error('---- FULL MINIO/H5P ERROR ----');
    //   console.error({
    //     code: error.code,
    //     message: error.message,
    //     stack: error.stack,
    //   });
    //   throw new BadRequestException(
    //     'Failed to process H5P file. Check server logs.',
    //   );
    // }
  }

  /**
   * Helper: Unzips buffer in memory and uploads all files to MinIO in parallel
   */
  private async extractAndUploadZip(
    buffer: Buffer,
    destinationFolder: string,
  ): Promise<void> {
    // Create a new promise to manage the asynchronous unzipping and uploading
    return new Promise<void>((resolve, reject) => {
      // Use a .then() chain on unzipper.Open.buffer for async handling
      unzipper.Open.buffer(buffer)
        .then(async (directory) => {
          const uploadPromises = directory.files.map(async (entry) => {
            if (entry.type === 'Directory') return; // Skip directories

            // The object name retains the internal folder structure
            const objectName = `${destinationFolder}/${entry.path}`;
            const contentType = this.getContentType(entry.path);

            // Get the stream for the file content
            const fileStream = entry.stream();

            // Upload the file using MinIO's putObject with a stream
            // MinIO requires the size (entry.uncompressedSize) when using a stream.
            await this.client.putObject(
              this.bucketName,
              objectName,
              fileStream,
              entry.uncompressedSize, // IMPORTANT: Use uncompressedSize
              { 'Content-Type': contentType },
            );
          });

          // Wait for ALL file uploads to complete
          await Promise.all(uploadPromises);
          resolve(); // Resolve the main promise when done
        })
        .catch((error) => {
          // Log the error from the new library to diagnose
          console.error('Unzipper/Extraction Error:', error);
          reject(error);
        });
    });
  }
  /**
   * Helper: Determine Content-Type based on extension
   * H5P relies heavily on correct mime types for JSON, JS, and CSS.
   */
  private getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();

    switch (ext) {
      case '.json':
        return 'application/json';
      case '.js':
        return 'application/javascript';
      case '.css':
        return 'text/css';
      case '.html':
        return 'text/html';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.svg':
        return 'image/svg+xml';
      case '.gif':
        return 'image/gif';
      case '.mp4':
        return 'video/mp4';
      case '.mp3':
        return 'audio/mpeg';
      case '.wav':
        return 'audio/wav';
      case '.xml':
        return 'application/xml';
      case '.woff':
        return 'font/woff';
      case '.woff2':
        return 'font/woff2';
      case '.ttf':
        return 'font/ttf';
      default:
        return 'application/octet-stream';
    }
  }
}
