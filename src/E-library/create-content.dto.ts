import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsUrl,
} from 'class-validator';

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  typeId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl({}, { message: 'fileUrl must be a valid URL' })
  fileUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'thumbnailUrl must be a valid URL' })
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  typeId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl({}, { message: 'fileUrl must be a valid URL' })
  fileUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'thumbnailUrl must be a valid URL' })
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
