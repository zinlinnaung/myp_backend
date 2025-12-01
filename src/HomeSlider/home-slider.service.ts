import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    await this.findOne(id); // Ensure slider exists

    let imageUrl: string | undefined = undefined;

    if (dto.image) {
      // Check if it's a base64 string
      const isBase64 = dto.image.match(/^data:image\/\w+;base64,/);

      if (isBase64) {
        // It's a base64 string with data URL prefix
        const base64Data = dto.image.replace(/^data:image\/\w+;base64,/, '');

        try {
          const buffer = Buffer.from(base64Data, 'base64');
          const fileName = `slider_${Date.now()}.png`;

          // upload to minio - use folder from dto or default
          imageUrl = await this.minio.uploadImage(
            buffer,
            fileName,
            dto.folder || 'slider',
            dto.isPublic !== undefined ? dto.isPublic : true,
          );
        } catch (error) {
          throw new BadRequestException('Invalid base64 image data');
        }
      } else {
        // It might already be a URL or invalid data
        // For simplicity, we'll assume it's a valid Minio URL
        // You could add validation here to check if it's a valid Minio URL
        imageUrl = dto.image;
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (imageUrl) {
      updateData.image = imageUrl;
    }

    // If folder or isPublic are provided, we don't store them in the slider table
    // but we could log them or handle them differently
    if (dto.folder) {
      updateData.folder = dto.folder; // If you want to store folder info
    }

    return this.prisma.course.homeSlider.update({
      where: { id },
      data: updateData,
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
