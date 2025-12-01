import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { Express } from 'express';

@Injectable()
export class MinioService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_END_POINT!,
      port: Number(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    });
  }

  async upload(file: Express.Multer.File, bucket: string, folder?: string) {
    const name = `${Date.now()}-${file.originalname}`;

    const objectName = folder ? `${folder}/${name}` : name;

    await this.client.putObject(bucket, objectName, file.buffer);

    return {
      fileName: objectName,
      url: `https://${process.env.MINIO_END_POINT}/${bucket}/${objectName}`,
    };
  }
}
