import { Module } from '@nestjs/common';
import { CourseSectionService } from './course-section.service';
import { CourseSectionController } from './course-section.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CourseSectionController],
  providers: [CourseSectionService, PrismaService],
})
export class CourseSectionModule {}
