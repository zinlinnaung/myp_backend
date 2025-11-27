import { Module } from '@nestjs/common';
import { HomeCategoryService } from './home-category.service';
import { HomeCategoryController } from './home-category.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [HomeCategoryController],
  providers: [HomeCategoryService, PrismaService],
})
export class HomeCategoryModule {}
