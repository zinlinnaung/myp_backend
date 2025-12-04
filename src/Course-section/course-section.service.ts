import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';

@Injectable()
export class CourseSectionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCourseSectionDto) {
    return this.prisma.course.courseSection.create({
      data: {
        title: dto.title,
        description: dto.description,
        courseId: dto.courseId,
        order: dto.order,
      },
    });
  }

  async findAll() {
    return this.prisma.course.courseSection.findMany({
      include: { activities: true, course: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const section = await this.prisma.course.courseSection.findUnique({
      where: { id },
      include: { activities: true, course: true },
    });

    if (!section) {
      throw new NotFoundException('Course section not found');
    }

    return section;
  }

  async update(id: string, dto: UpdateCourseSectionDto) {
    return this.prisma.course.courseSection.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.course.courseSection.delete({
      where: { id },
    });
  }
}
