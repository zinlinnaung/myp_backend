// dto/instructor.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateInstructorDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string; // Link to the existing User

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsUUID('4', { each: true }) // Validate each ID in the array
  @IsOptional()
  roleIds?: string[]; // e.g., ["uuid-1", "uuid-2"]
}

export class UpdateInstructorDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  roleIds?: string[]; // If provided, this will REPLACE existing roles
}
