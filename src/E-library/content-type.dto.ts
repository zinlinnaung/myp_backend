import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateContentTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateContentTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
