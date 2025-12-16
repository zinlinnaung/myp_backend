import { BadRequestException, Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { randomBytes } from 'crypto';
import { Client } from 'minio';
import path from 'path';

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
    const timestamp = Date.now();
    const uniqueId = `${activityId}_${timestamp}`;

    // Paths
    const originalH5PPath = `private/h5p/originals/${uniqueId}.h5p`;
    const extractedBasePath = `public/h5p/content/${uniqueId}`; // Making content public for the player

    try {
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
    } catch (error: any) {
      console.error('---- FULL MINIO/H5P ERROR ----');
      console.error({
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw new BadRequestException(
        'Failed to process H5P file. Check server logs.',
      );
    }
  }

  /**
   * Helper: Unzips buffer in memory and uploads all files to MinIO in parallel
   */
  private async extractAndUploadZip(
    buffer: Buffer,
    destinationFolder: string,
  ): Promise<void> {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Create a promise for each file in the zip
    const uploadPromises = zipEntries.map(async (entry) => {
      if (entry.isDirectory) return;

      const fileContent = entry.getData();

      // Construct the full path inside MinIO (preserving zip folder structure)
      // entry.entryName includes the internal folder structure (e.g., "H5P.CoursePresentation-1.21/library.json")
      const objectName = `${destinationFolder}/${entry.entryName}`;

      const contentType = this.getContentType(entry.entryName);

      await this.client.putObject(
        this.bucketName,
        objectName,
        fileContent,
        fileContent.length,
        { 'Content-Type': contentType },
      );
    });

    // Run all uploads in parallel
    // Note: For very large H5P files, you might want to limit concurrency (e.g. using p-limit)
    await Promise.all(uploadPromises);
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
