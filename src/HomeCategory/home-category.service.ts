import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHomeCategoryDto,
  UpdateHomeCategoryDto,
} from './dto/home-category.dto';
import {
  CreateHomeCategoryItemDto,
  UpdateHomeCategoryItemDto,
} from './dto/home-category-item.dto';

@Injectable()
export class HomeCategoryService {
  constructor(private prisma: PrismaService) {}

  // ----------------- HomeCategory -----------------
  async createCategory(dto: CreateHomeCategoryDto) {
    return this.prisma.course.homeCategory.create({
      data: {
        name: dto.name,
        items: dto.itemIds
          ? {
              create: dto.itemIds.map((courseId) => ({
                courseId,

                type: 'NORMAL' as const, // Prisma enum
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  async findAllCategories() {
    return this.prisma.course.homeCategory.findMany({
      include: { items: true },
      where: { isDeleted: false },
    });
  }

  async findCategoryById(id: string) {
    const category = await this.prisma.course.homeCategory.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!category) throw new NotFoundException('HomeCategory not found');
    return category;
  }

  async updateCategory(id: string, dto: UpdateHomeCategoryDto) {
    const current = await this.prisma.course.homeCategory.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!current) {
      throw new NotFoundException('HomeCategory not found');
    }

    const currentIds = current.items.map((i) => i.courseId);
    const newIds = dto.itemIds ?? [];

    // 1. Find removed items
    const toDelete = currentIds.filter((id) => !newIds.includes(id));

    // 2. Find new items to create
    const toCreate = newIds.filter((id) => !currentIds.includes(id));

    return this.prisma.course.homeCategory.update({
      where: { id },
      data: {
        name: dto.name,

        items: {
          // remove old relations
          deleteMany: {
            courseId: { in: toDelete },
          },

          // add new ones
          create: toCreate.map((courseId) => ({
            courseId,
            type: 'NORMAL',
          })),
        },
      },
      include: { items: true },
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.course.homeCategory.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  // ----------------- HomeCategoryItem -----------------
  async createItem(dto: CreateHomeCategoryItemDto) {
    return this.prisma.course.homeCategoryItem.create({
      data: {
        homeCategoryId: dto.homeCategoryId,
        courseId: dto.courseId,
        type: dto.type, // enum cast if needed: dto.type as const
      },
    });
  }

  async findAllItems(homeCategoryId?: string) {
    console.log('ral', homeCategoryId);
    const category = await this.prisma.course.homeCategory.findUnique({
      where: { id: homeCategoryId },
      include: { items: true },
    });
    if (!category) throw new NotFoundException('HomeCategory not found');
    // return category;
    // if (homeCategoryId) {
    //   const category = await this.prisma.course.homeCategory.findUnique({
    //     where: { id: homeCategoryId },
    //     include: { items: true },
    //   });

    //   if (!category || category.isDeleted) {
    //     throw new NotFoundException('HomeCategory not found');
    //   }

    // Filter deleted items
    const filteredItems = category.items.filter((item: any) => !item.isDeleted);

    return { ...category, items: filteredItems };
    // }

    // If no ID provided, return all categories
    const categories = await this.prisma.course.homeCategory.findMany({
      include: { items: true },
    });

    return categories.map((cat) => ({
      ...cat,
      items: cat.items.filter((item: any) => !item.isDeleted),
    }));
  }

  async findItemById(id: string) {
    const item = await this.prisma.course.homeCategoryItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('HomeCategoryItem not found');
    return item;
  }

  async updateItem(id: string, dto: UpdateHomeCategoryItemDto) {
    return this.prisma.course.homeCategoryItem.update({
      where: { id },
      data: dto,
    });
  }

  async deleteItem(id: string) {
    return this.prisma.course.homeCategoryItem.update({
      where: { id },
      data: { isDeleted: true } as any, // bypass TS
    });
  }
}
