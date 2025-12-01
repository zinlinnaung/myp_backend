import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from './minio.service';
import { UploadDto } from './dto/upload.dto';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly minioService: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  //   @Post()
  //   @UseInterceptors(FileInterceptor('file'))
  //   async upload(
  //     @UploadedFile() file: Express.Multer.File,
  //     @Query() dto: UploadDto,
  //   ) {
  //     const result = await this.minioService.upload(
  //       file,
  //       process.env.MINIO_BUCKET!,
  //       dto.folder,
  //     );

  //     const saved = await this.prisma.upload.create({
  //       data: {
  //         fileName: result.fileName,
  //         url: result.url,
  //         folder: dto.folder ?? null,
  //       },
  //     });

  //     return saved;
  //   }
}
