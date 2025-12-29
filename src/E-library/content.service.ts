import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioService } from 'src/Minio/minio.service';
import { CreateContentDto, UpdateContentDto } from './create-content.dto';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  /**
   * Uploads a file to Minio and returns the public URL
   */
  async uploadFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const url = await this.minioService.uploadPublicFile(
      file.buffer,
      `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`,
      'elibrary',
    );

    return { url };
  }

  /**
   * Creates a new content record
   */
  async create(data: CreateContentDto) {
    if (!data.typeId || typeof data.typeId !== 'string') {
      throw new BadRequestException('typeId must be a non-empty string');
    }

    return this.prisma.course.content.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        fileUrl: data.fileUrl,
        thumbnailUrl: data.thumbnailUrl,
        author: data.author || 'Admin',
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        type: { connect: { id: data.typeId } },
        category: data.categoryId
          ? { connect: { id: data.categoryId } }
          : undefined,
      },
    });
  }

  /**
   * Updates an existing content record
   */
  async update(id: string, data: UpdateContentDto) {
    if (data.typeId && typeof data.typeId !== 'string') {
      throw new BadRequestException('typeId must be a string');
    }

    return this.prisma.course.content.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        typeId: data.typeId,
        categoryId: data.categoryId,
      },
    });
  }

  /**
   * Retrieves all content with relations
   */
  async findAll() {
    return this.prisma.course.content.findMany({
      include: {
        type: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retrieves a single content by ID
   */
  async findOne(id: string) {
    const item = await this.prisma.course.content.findUnique({
      where: { id },
      include: { type: true, category: true },
    });

    if (!item) throw new NotFoundException(`Content with ID ${id} not found`);
    return item;
  }

  /**
   * Deletes a content record
   */
  async remove(id: string) {
    return this.prisma.course.content.delete({ where: { id } });
  }
}
