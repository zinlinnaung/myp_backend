import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { CourseStatus } from '@prisma/client'; // Import from your generated prisma client

export class CreateUserOnCourseDto {
  @IsString()
  userId: string;

  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsUUID()
  course2Id?: string;
}

export class UpdateUserOnCourseDto {
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completedPercentage?: number;

  @IsOptional()
  @IsString()
  certificate?: string;
}
