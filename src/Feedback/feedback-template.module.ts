import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { FeedbackTemplateController } from './feedback-template.controller';
import { FeedbackTemplateService } from './feedback-template.service';

@Module({
  controllers: [FeedbackTemplateController],
  providers: [
    FeedbackTemplateService, // 2. Add the Service here
    PrismaService,
  ],
})
export class CertificateTemplateModule {}
