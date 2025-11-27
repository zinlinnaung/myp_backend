import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CourseType } from '@prisma/client';

export class CreateHomeCategoryItemDto {
  @IsNotEmpty()
  @IsString()
  homeCategoryId: string;

  @IsNotEmpty()
  @IsString()
  courseId: string;

  @IsEnum(CourseType)
  type: CourseType;

  @IsOptional()
  isDeleted?: boolean;
}

export class UpdateHomeCategoryItemDto extends PartialType(
  CreateHomeCategoryItemDto,
) {}
