import { CategoryType } from '@prisma/client';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
