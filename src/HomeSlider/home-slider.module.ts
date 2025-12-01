import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HomeSliderController } from './home-slider.controller';
import { HomeSliderService } from './home-slider.service';
import { MinioModule } from 'src/Minio/minio.module';

@Module({
  imports: [MinioModule], // <-- ADD THIS
  controllers: [HomeSliderController],
  providers: [HomeSliderService, PrismaService],
})
export class HomeSliderModule {}
