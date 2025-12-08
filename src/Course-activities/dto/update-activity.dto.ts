import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityDto } from './create-activity.dto';
import { IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
import { ActivityType } from 'generated/course';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
