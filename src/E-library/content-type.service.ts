import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContentTypeDto, UpdateContentTypeDto } from './content-type.dto';

@Injectable()
export class ContentTypeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContentTypeDto) {
    const exists = await this.prisma.course.contentType.findFirst({
      where: { name: dto.name },
    });

    if (exists) {
      throw new BadRequestException('Content type already exists');
    }

    return this.prisma.course.contentType.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.course.contentType.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.course.contentType.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Content type not found');
    }

    return item;
  }

  async update(id: string, dto: UpdateContentTypeDto) {
    await this.findOne(id); // ensure exists

    return this.prisma.course.contentType.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // ensure exists

    return this.prisma.course.contentType.delete({
      where: { id },
    });
  }
}
