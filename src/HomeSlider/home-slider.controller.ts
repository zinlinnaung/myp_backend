import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { HomeSliderService } from './home-slider.service';
import { CreateHomeSliderDto } from './dto/create-home-slider.dto';
import { UpdateHomeSliderDto } from './dto/update-home-slider.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('home-slider')
export class HomeSliderController {
  constructor(private readonly homeSliderService: HomeSliderService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary', // tells Swagger this is a file
        },
        folder: {
          type: 'string',
        },
        isPublic: {
          type: 'boolean',
        },
      },
      required: ['image', 'folder', 'isPublic'],
    },
  })
  uploadSlider(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateHomeSliderDto,
  ) {
    return this.homeSliderService.create(file, dto);
  }

  @Get()
  findAll() {
    return this.homeSliderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeSliderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHomeSliderDto) {
    return this.homeSliderService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.homeSliderService.remove(id);
  }
}
