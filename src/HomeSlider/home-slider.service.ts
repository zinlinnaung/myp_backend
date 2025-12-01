import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHomeSliderDto } from './dto/create-home-slider.dto';
import { UpdateHomeSliderDto } from './dto/update-home-slider.dto';
import { MinioService } from 'src/Minio/minio.service';

@Injectable()
export class HomeSliderService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async create(file: Express.Multer.File, dto: CreateHomeSliderDto) {
    if (!file) throw new Error('Image is required');

    const fileName = `slider_${Date.now()}.png`;

    // upload to minio
    const imageUrl = await this.minio.uploadImage(
      file.buffer,
      fileName,
      dto.folder || 'slider',
      dto.isPublic,
    );

    console.log('dto', dto.isPublic);
    // save to DB
    return this.prisma.course.homeSlider.create({
      data: {
        image: imageUrl,
      },
    });
  }

  async update(id: string, dto: UpdateHomeSliderDto) {
    await this.findOne(id);

    let imageUrl: string | undefined = undefined;

    if (dto.image) {
      const base64Data = dto.image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const fileName = `slider_${Date.now()}.png`;

      // upload to optional folder: "slider"
      imageUrl = await this.minio.uploadImage(buffer, fileName, 'slider', true);
    }

    return this.prisma.course.homeSlider.update({
      where: { id },
      data: {
        ...(imageUrl ? { image: imageUrl } : {}),
        updatedAt: new Date(),
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

  //   async update(id: string, dto: UpdateHomeSliderDto) {
  //     await this.findOne(id); // ensures 404 if not found

  //     return this.prisma.course.homeSlider.update({
  //       where: { id },
  //       data: {
  //         ...dto,
  //         updatedAt: new Date(),
  //       },
  //     });
  //   }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.course.homeSlider.delete({
      where: { id },
    });
  }
}
