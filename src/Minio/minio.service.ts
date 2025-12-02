import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private readonly bucketName = 'dev';

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
   * Upload image (public or private)
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

    await this.client.putObject(
      this.bucketName,
      objectName,
      fileBuffer,
      fileBuffer.length,
      {
        'Content-Type': fileName.endsWith('.png')
          ? 'image/png'
          : 'application/octet-stream',
      },
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

  /**
   * Upload private image with temporary key
   */
  async uploadImagePrivate(
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
  ) {
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) await this.client.makeBucket(this.bucketName);

    const objectName = `private/${folder}/${fileName}`;
    await this.client.putObject(
      this.bucketName,
      objectName,
      fileBuffer,
      fileBuffer.length,
    );

    // Generate temporary key
    const token = randomBytes(32).toString('hex');
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours
    const expiresAt = Date.now() + expiresIn;

    this.tempKeys.set(token, { token, objectName, expiresAt });

    const baseUrl = 'https://mmyouth-minio.bitmyanmar.info';
    const encodedPath = encodeURIComponent(objectName);
    const url = `/files/download?path=${encodedPath}&key=${token}`;
    const fullUrl = `${baseUrl}${url}`;

    return {
      path: objectName,
      url,
      fullUrl,
      key: token,
      expiresAt,
    };
  }

  /**
   * Get a MinIO object stream
   */
  async getObjectStream(objectName: string) {
    return this.client.getObject(this.bucketName, objectName);
  }

  /**
   * Validate temporary key
   */
  async validateTempKey(token: string) {
    return this.tempKeys.get(token) || null;
  }

  /**
   * Generate presigned MinIO URL
   */
  async getSignedUrl(objectName: string) {
    return this.client.presignedGetObject(this.bucketName, objectName, 60); // 1 min
  }
}
