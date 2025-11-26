import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateSubCategoryDto {
  @IsString()
  name: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

export class UpdateSubCategoryDto extends CreateSubCategoryDto {}
