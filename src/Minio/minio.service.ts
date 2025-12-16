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
    const uniqueId = `${activityId}_${Date.now()}`;
    const extractedFolderPath = `private/h5p/extracted/${uniqueId}`;

    const zip = new AdmZip(fileBuffer);
    const zipEntries = zip.getEntries();

    const uploadPromises = zipEntries
      .filter((entry) => !entry.isDirectory)
      .map(async (entry) => {
        // Use "this" to call the class method
        const sanitizedEntryName = this.sanitizePath(entry.entryName);
        const entryPath = `${extractedFolderPath}/${sanitizedEntryName}`;

        const entryBuffer = entry.getData();
        if (!entryBuffer || entryBuffer.length === 0) return;

        return this.client.putObject(
          this.bucketName,
          entryPath,
          entryBuffer,
          entryBuffer.length,
          { 'Content-Type': this.getContentType(entryPath) },
        );
      });

    await Promise.all(uploadPromises);
    // ... return response
  }

  // 2. Define this as a Private Method inside the class
  private sanitizePath(entryName: string): string {
    return entryName
      .replace(/\\/g, '/') // backslashes → forward slashes
      .replace(/\.\./g, '') // remove parent traversal
      .replace(/\s+/g, '_') // replace spaces with underscores
      .replace(/[^\w\-./]/g, '') // remove unsafe characters
      .replace(/^\/+/, '') // remove leading slashes
      .replace(/\/+$/, '') // remove trailing slashes
      .replace(/\/{2,}/g, '/'); // collapse duplicate slashes
  }

  // 3. Define this as a Private Method as well
  private getContentType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      json: 'application/json',
      js: 'application/javascript',
      css: 'text/css',
      svg: 'image/svg+xml',
      html: 'text/html',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
    };
    return map[ext] || 'application/octet-stream';
  }
}
