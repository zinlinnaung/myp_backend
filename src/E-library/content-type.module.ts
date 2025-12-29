import { Module } from '@nestjs/common';
import { ContentTypeService } from './content-type.service';
import { ContentTypeController } from './content-type.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ContentTypeController],
  providers: [ContentTypeService, PrismaService],
})
export class ContentTypeModule {}
