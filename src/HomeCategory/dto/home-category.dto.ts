import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHomeCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString({ each: true })
  itemIds?: string[];
}

export class UpdateHomeCategoryDto extends PartialType(CreateHomeCategoryDto) {}
