import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHomeSliderDto } from './dto/create-home-slider.dto';
import { UpdateHomeSliderDto } from './dto/update-home-slider.dto';

@Injectable()
export class HomeSliderService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHomeSliderDto) {
    return this.prisma.course.homeSlider.create({
      data: {
        image: dto.image,
      },
    });
  }

  async findAll() {
    return this.prisma.course.homeSlider.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const slider = await this.prisma.course.homeSlider.findUnique({
      where: { id },
    });

    if (!slider) {
      throw new NotFoundException('HomeSlider not found');
    }

    return slider;
  }

  async update(id: string, dto: UpdateHomeSliderDto) {
    await this.findOne(id); // ensures 404 if not found

    return this.prisma.course.homeSlider.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.course.homeSlider.delete({
      where: { id },
    });
  }
}
