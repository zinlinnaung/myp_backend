import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { HomeCategoryService } from './home-category.service';
import {
  CreateHomeCategoryDto,
  UpdateHomeCategoryDto,
} from './dto/home-category.dto';
import {
  CreateHomeCategoryItemDto,
  UpdateHomeCategoryItemDto,
} from './dto/home-category-item.dto';

@Controller('home-category')
export class HomeCategoryController {
  constructor(private readonly service: HomeCategoryService) {}

  // ----------------- HomeCategory -----------------
  @Post()
  createCategory(@Body() dto: CreateHomeCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Get()
  findAllCategories() {
    return this.service.findAllCategories();
  }

  @Get(':id')
  findCategory(@Param('id') id: string) {
    return this.service.findCategoryById(id);
  }

  @Put(':id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateHomeCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string) {
    return this.service.deleteCategory(id);
  }

  // ----------------- HomeCategoryItem -----------------
  @Post('item')
  createItem(@Body() dto: CreateHomeCategoryItemDto) {
    return this.service.createItem(dto);
  }

  @Get('item/:homeCategoryId')
  findAllItems(@Param('homeCategoryId') homeCategoryId: string) {
    console.log(homeCategoryId);
    return this.service.findAllItems(homeCategoryId);
  }

  @Get('item/:id')
  findItem(@Param('id') id: string) {
    return this.service.findItemById(id);
  }

  @Put('item/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateHomeCategoryItemDto) {
    return this.service.updateItem(id, dto);
  }

  @Delete('item/:id')
  deleteItem(@Param('id') id: string) {
    return this.service.deleteItem(id);
  }
}
