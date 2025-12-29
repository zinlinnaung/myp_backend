import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ContentTypeService } from './content-type.service';
import { CreateContentTypeDto, UpdateContentTypeDto } from './content-type.dto';

@Controller('content-types')
export class ContentTypeController {
  constructor(private readonly service: ContentTypeService) {}

  @Post()
  create(@Body() dto: CreateContentTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContentTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
