import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserOnCourseService } from './user-on-course.service';
import {
  CreateUserOnCourseDto,
  UpdateUserOnCourseDto,
} from './dto/user-on-course.dto';

@Controller('user-on-course')
export class UserOnCourseController {
  constructor(private readonly service: UserOnCourseService) {}

  @Post('enroll')
  create(@Body() dto: CreateUserOnCourseDto) {
    return this.service.enrollUser(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserOnCourseDto,
  ) {
    return this.service.updateProgress(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
