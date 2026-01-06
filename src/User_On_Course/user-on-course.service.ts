import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import {
  CreateUserOnCourseDto,
  UpdateUserOnCourseDto,
} from './dto/user-on-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserOnCourseService {
  constructor(private prisma: PrismaService) {}

  async enrollUser(data: CreateUserOnCourseDto) {
    try {
      return await this.prisma.course.userOnCourse.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User is already enrolled in this course');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.course.userOnCourse.findMany({
      include: { Course: true },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.course.userOnCourse.findUnique({
      where: { id },
      include: { Course: true, course2: true },
    });
    if (!record)
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    return record;
  }

  async updateProgress(id: string, data: UpdateUserOnCourseDto) {
    return this.prisma.course.userOnCourse.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.course.userOnCourse.delete({
      where: { id },
    });
  }
}
