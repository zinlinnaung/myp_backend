// instructors.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto, UpdateInstructorDto } from './dto/instructor.dto';

@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Post()
  create(@Body() createInstructorDto: CreateInstructorDto) {
    return this.instructorsService.createInstructor(createInstructorDto);
  }

  @Get()
  findAll() {
    return this.instructorsService.findAllInstructors();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instructorsService.findOneInstructor(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInstructorDto: UpdateInstructorDto,
  ) {
    return this.instructorsService.updateInstructor(id, updateInstructorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.instructorsService.deleteInstructor(id);
  }
}
