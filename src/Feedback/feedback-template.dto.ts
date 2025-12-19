import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateFeedbackTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsNotEmpty()
  content: any[]; // The JSON Question array
}

export class UpdateFeedbackTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  content?: any[];
}
