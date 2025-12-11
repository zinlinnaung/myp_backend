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

    const originalH5PPath = `private/h5p/h5p/${uniqueId}.h5p`;
    const extractedFolderPath = `private/h5p/extracted/${uniqueId}`;

    // Helper to create "folders" in MinIO
    const ensureFolderExists = async (path: string) => {
      if (!path) return;
      const parts = path.split('/');
      let current = '';
      for (const part of parts) {
        current += part + '/';
        try {
          // MinIO doesn't fail if object exists
          await this.client.putObject(
            this.bucketName,
            current,
            Buffer.alloc(0),
          );
        } catch (e) {
          // ignore errors
        }
      }
    };

    try {
      // 1️⃣ Upload original H5P file
      await this.client.putObject(
        this.bucketName,
        originalH5PPath,
        fileBuffer,
        fileBuffer.length,
        { 'Content-Type': 'application/zip' },
      );

      // 2️⃣ Extract ZIP
      const zip = new AdmZip(fileBuffer);
      const zipEntries = zip.getEntries();

      // 3️⃣ Upload each extracted file
      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;

        // --- SANITIZE PATH ---
        const sanitizedEntryName = entry.entryName
          .replace(/\\/g, '/')
          .replace(/\.\./g, '') // remove parent traversal
          .replace(/^\/+/, '') // remove leading slashes
          .replace(/\/+$/, '') // remove trailing slashes
          .replace(/\/{2,}/g, '/'); // collapse double slashes

        if (!sanitizedEntryName) continue;

        const entryBuffer = entry.getData();
        if (!entryBuffer || entryBuffer.length === 0) continue;

        const entryPath = `${extractedFolderPath}/${sanitizedEntryName}`;

        // --- ENSURE PARENT FOLDERS EXIST ---
        const parentFolder = entryPath.split('/').slice(0, -1).join('/');
        await ensureFolderExists(parentFolder);

        // --- SIMPLE CONTENT TYPE DETECTION ---
        let contentType = 'application/octet-stream';
        if (entryPath.endsWith('.json')) contentType = 'application/json';
        else if (entryPath.endsWith('.js'))
          contentType = 'application/javascript';
        else if (entryPath.endsWith('.css')) contentType = 'text/css';
        else if (entryPath.endsWith('.svg')) contentType = 'image/svg+xml';
        else if (entryPath.endsWith('.html')) contentType = 'text/html';
        else if (entryPath.endsWith('.png')) contentType = 'image/png';
        else if (entryPath.endsWith('.jpg') || entryPath.endsWith('.jpeg'))
          contentType = 'image/jpeg';

        // --- UPLOAD FILE ---
        await this.client.putObject(
          this.bucketName,
          entryPath,
          entryBuffer,
          entryBuffer.length,
          { 'Content-Type': contentType },
        );
      }

      return {
        originalPath: originalH5PPath,
        extractedFolder: extractedFolderPath,
        mainEntryFile: `${extractedFolderPath}/h5p.json`,
        timestamp,
      };
    } catch (error: any) {
      // Full logging for MinIO errors
      console.error('---- FULL MINIO ERROR ----');
      console.error({
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        resource: error.resource,
        bucketName: error.bucketName,
        region: error.region,
        stack: error.stack,
      });
      console.error('---------------------------');

      throw new BadRequestException(
        'Failed to extract and upload H5P. Check server logs for details.',
      );
    }
  }
}
