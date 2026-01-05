import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';

@Module({
  controllers: [InstructorsController],
  providers: [InstructorsService, PrismaService],
})
export class InstructorModule {}
