import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UserOnCourseController } from './user-on-course.controller';
import { UserOnCourseService } from './user-on-course.service';

@Module({
  controllers: [UserOnCourseController],
  providers: [UserOnCourseService, PrismaService],
})
export class UserOnCourseModule {}
