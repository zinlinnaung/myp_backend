import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    return this.prisma.course.category.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.course.category.findMany({
      include: {
        subCategories: true,
        courses: true,
        contents: true,
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.course.category.findUnique({
      where: { id },
      include: {
        subCategories: true,
        courses: true,
        contents: true,
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id); // ensure category exists
    return this.prisma.course.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // ensure category exists
    return this.prisma.course.category.delete({ where: { id } });
  }
}
