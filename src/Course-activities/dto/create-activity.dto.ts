import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import { ActivityType } from 'generated/course';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(ActivityType)
  type: ActivityType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @IsOptional()
  @IsString()
  description?: string;
}
