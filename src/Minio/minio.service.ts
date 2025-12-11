import { BadRequestException, Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { randomBytes } from 'crypto';
import { Client } from 'minio';

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

  async uploadAndExtractH5P(
    fileBuffer: Buffer,
    fileName: string,
    activityId: string,
  ) {
    const timestamp = Date.now();
    const uniqueId = `${activityId}_${timestamp}`;

    // 1. Define Paths
    // Path for the original .h5p file
    const originalH5PPath = `private/h5p/h5p/${uniqueId}.h5p`;
    // Folder path for extracted content
    const extractedFolderPath = `private/h5p/extracted/${uniqueId}`;

    // 2. Upload the Original .h5p File
    await this.client.putObject(
      this.bucketName,
      originalH5PPath,
      fileBuffer,
      fileBuffer.length,
      { 'Content-Type': 'application/zip' }, // H5P is a zip
    );

    // 3. Extract and Upload Contents
    try {
      const zip = new AdmZip(fileBuffer);
      const zipEntries = zip.getEntries(); // Get all files in zip

      const uploadPromises = zipEntries.map(async (entry) => {
        if (entry.isDirectory) return; // Skip directories, MinIO creates them implicitly

        const entryBuffer = entry.getData();
        const entryPath = `${extractedFolderPath}/${entry.entryName}`;

        // Simple Content-Type detection for extracted files
        let contentType = 'application/octet-stream';
        if (entry.entryName.endsWith('.json')) contentType = 'application/json';
        else if (entry.entryName.endsWith('.js'))
          contentType = 'application/javascript';
        else if (entry.entryName.endsWith('.css')) contentType = 'text/css';
        else if (entry.entryName.endsWith('.png')) contentType = 'image/png';
        else if (entry.entryName.endsWith('.jpg')) contentType = 'image/jpeg';
        else if (entry.entryName.endsWith('.mp4')) contentType = 'video/mp4';
        else if (entry.entryName.endsWith('.mp3')) contentType = 'audio/mpeg';

        await this.client.putObject(
          this.bucketName,
          entryPath,
          entryBuffer,
          entryBuffer.length,
          { 'Content-Type': contentType },
        );
      });

      // Wait for all extracted files to upload
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error extracting H5P:', error);
      throw new BadRequestException('Failed to process H5P file structure');
    }

    return {
      originalPath: originalH5PPath,
      extractedFolder: extractedFolderPath,
      mainEntryFile: `${extractedFolderPath}/h5p.json`, // Usually the entry point
      timestamp: timestamp,
    };
  }
}
