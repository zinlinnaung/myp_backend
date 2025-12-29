import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateContentDto, UpdateContentDto } from './create-content.dto';
import { MinioService } from 'src/Minio/minio.service';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  // Handles the file upload and returns the public URL
  async uploadFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    // Using your MinioService's public upload method
    const url = await this.minioService.uploadPublicFile(
      file.buffer,
      `${Date.now()}-${file.originalname}`, // Unique filename
      'elibrary-assets', // Folder name in bucket
    );

    return { url };
  }

  async create(data: CreateContentDto) {
    return this.prisma.course.content.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        fileUrl: data.fileUrl,
        thumbnailUrl: data.thumbnailUrl,
        // Assuming your DTO sends Type ID and Category ID
        type: { connect: { id: data.typeId } },
        category: { connect: { id: data.categoryId } },
      },
    });
  }

  findAll() {
    return this.prisma.course.content.findMany({
      include: {
        type: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.course.content.findUnique({
      where: { id },
      include: { type: true, category: true },
    });
  }

  async update(id: string, data: UpdateContentDto) {
    return this.prisma.course.content.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        fileUrl: data.fileUrl,
        thumbnailUrl: data.thumbnailUrl,
        typeId: data.typeId, // Direct update if field exists
        categoryId: data.categoryId, // Direct update if field exists
      },
    });
  }

  remove(id: string) {
    return this.prisma.course.content.delete({ where: { id } });
  }
}
