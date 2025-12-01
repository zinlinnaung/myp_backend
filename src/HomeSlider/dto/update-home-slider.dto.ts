import { PartialType } from '@nestjs/mapped-types';
import { CreateHomeSliderDto } from './create-home-slider.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateHomeSliderDto extends PartialType(CreateHomeSliderDto) {
  @IsOptional()
  @IsString()
  image?: string; // This should be base64 string, not URL
}
