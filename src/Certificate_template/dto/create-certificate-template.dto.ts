import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';

export class CreateCertificateTemplateDto {
  @IsString()
  @IsNotEmpty()
  id: string; // Remove this if you use @default(uuid()) or @default(cuid()) in Prisma

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsObject()
  @IsNotEmpty()
  components: any; // You can define a more specific interface for your JSON structure here
}
