import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private readonly bucketName = 'dev'; // Correct bucket

  private readonly client = new Client({
    endPoint: 'mmyouth-minio.bitmyanmar.info',
    port: 443,
    useSSL: true,
    accessKey: 'minio',
    secretKey: '1XUKd8CCtASzGvtn',
  });

  async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    folder: string,
    isPublic: boolean,
  ): Promise<string> {
    // Check if bucket exists
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) {
      await this.client.makeBucket(this.bucketName);
    }

    console.log(isPublic);

    // Build object key
    const baseFolder = isPublic ? 'public' : 'private';
    const objectName = `${baseFolder}/${folder}/${fileName}`; // <-- folder structure

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
      // Public URL
      return `https://mmyouth-minio.bitmyanmar.info/${this.bucketName}/${objectName}`;
    }

    // Private = pre-signed URL (expires in 24 hours)
    return this.client.presignedGetObject(
      this.bucketName,
      objectName,
      24 * 60 * 60,
    );
  }

  // Optional: generate signed URL for existing private object
  async getPrivateFileUrl(
    folder: string,
    fileName: string,
    expiresInSec = 3600,
  ) {
    const objectName = `private/${folder}/${fileName}`;
    return this.client.presignedGetObject(
      this.bucketName,
      objectName,
      expiresInSec,
    );
  }
}
