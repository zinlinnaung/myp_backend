import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  videoCount?: number;

  @IsOptional()
  @IsNumber()
  enrolledCount?: number;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsUUID()
  parentCourseId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  subCategoryId?: string;

  // createdBy        String?
  // updatedBy

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class UpdateCourseDto extends CreateCourseDto {}
