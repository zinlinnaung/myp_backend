import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Prisma } from 'generated/course';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActivityDto) {
    return this.prisma.course.activity.create({
      data: {
        title: dto.title,
        type: dto.type,
        content: dto.content,
        order: dto.order,
        description: dto.description,
        sectionId: dto.sectionId,
      },
    });
  }
  

  async findAll() {
    return this.prisma.course.activity.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.course.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async update(id: string, dto: UpdateActivityDto) {
    await this.findOne(id);

    return this.prisma.course.activity.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.course.activity.delete({
      where: { id },
    });
  }
}
