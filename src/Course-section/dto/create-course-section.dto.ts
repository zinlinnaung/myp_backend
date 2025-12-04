import { IsOptional, IsString, IsUUID, IsInt } from 'class-validator';

export class CreateCourseSectionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
