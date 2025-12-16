import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe, // 1. Import the Pipe
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.courseService.create(dto);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  // 2. Apply the pipe to the @Param
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  // 3. Apply to update as well
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, dto);
  }

  @Delete(':id')
  // 4. Apply to delete
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.courseService.delete(id);
  }
}
