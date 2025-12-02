import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { FilesController } from './upload.controller';
import { MinioService } from './minio.service';

@Module({
  controllers: [FilesController],
  providers: [MinioService, PrismaService],

  // <-- THIS IS REQUIRED
  exports: [MinioService],
})
export class MinioModule {}
