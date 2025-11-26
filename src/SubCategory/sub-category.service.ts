import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
} from './dto/subcategory.dto';

@Injectable()
export class SubCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubCategoryDto) {
    // Ensure category exists
    const categoryExists = await this.prisma.course.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!categoryExists) {
      throw new NotFoundException(
        `Category with id ${dto.categoryId} does not exist`,
      );
    }

    return this.prisma.course.subCategory.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.course.subCategory.findMany({
      include: { category: true, courses: true },
    });
  }

  async findOne(id: string) {
    const subCategory = await this.prisma.course.subCategory.findUnique({
      where: { id },
      include: { category: true, courses: true },
    });
    if (!subCategory) throw new NotFoundException('SubCategory not found');
    return subCategory;
  }

  async update(id: string, dto: UpdateSubCategoryDto) {
    await this.findOne(id); // check if exists
    return this.prisma.course.subCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // check if exists
    return this.prisma.course.subCategory.delete({ where: { id } });
  }
}
