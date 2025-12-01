import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateHomeSliderDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'image must be a valid URL' })
  image: string;
}
