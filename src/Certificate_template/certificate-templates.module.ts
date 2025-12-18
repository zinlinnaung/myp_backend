import { Module } from '@nestjs/common';
import { CertificateTemplatesService } from './certificate-templates.service'; // 1. Import the service
import { CertificateTemplatesController } from './certificate-templates.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CertificateTemplatesController],
  providers: [
    CertificateTemplatesService, // 2. Add the Service here
    PrismaService,
  ],
})
export class CertificateTemplateModule {}
