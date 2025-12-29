import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioService } from 'src/Minio/minio.service';

@Module({
  controllers: [ContentController],
  providers: [ContentService, PrismaService, MinioService],
})
export class ContentModule {}
