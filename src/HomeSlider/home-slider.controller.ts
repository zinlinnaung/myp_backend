import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { HomeSliderService } from './home-slider.service';
import { CreateHomeSliderDto } from './dto/create-home-slider.dto';
import { UpdateHomeSliderDto } from './dto/update-home-slider.dto';

@Controller('home-slider')
export class HomeSliderController {
  constructor(private readonly homeSliderService: HomeSliderService) {}

  @Post()
  create(@Body() dto: CreateHomeSliderDto) {
    return this.homeSliderService.create(dto);
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
