import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HomeSliderController } from './home-slider.controller';
import { HomeSliderService } from './home-slider.service';

@Module({
  controllers: [HomeSliderController],
  providers: [HomeSliderService, PrismaService],
})
export class HomeSliderModule {}
