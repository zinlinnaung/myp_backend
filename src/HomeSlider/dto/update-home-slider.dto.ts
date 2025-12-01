import { PartialType } from '@nestjs/mapped-types';
import { CreateHomeSliderDto } from './create-home-slider.dto';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateHomeSliderDto extends PartialType(CreateHomeSliderDto) {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'image must be a valid URL' })
  image?: string;
}
