import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from 'src/Minio/minio.service';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, PrismaService, MinioService],
})
export class ActivityModule {}
