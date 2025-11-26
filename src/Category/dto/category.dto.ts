import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { CategoryType } from 'generated/course';

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
