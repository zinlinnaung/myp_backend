import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContentDto, UpdateContentDto } from './create-content.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateContentDto) {
    return this.prisma.course.content.create({ data });
  }

  findAll() {
    return this.prisma.course.content.findMany();
  }

  findOne(id: string) {
    return this.prisma.course.content.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateContentDto) {
    return this.prisma.course.content.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.course.content.delete({ where: { id } });
  }
}
