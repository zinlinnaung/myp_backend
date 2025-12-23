import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express'; // Required for setting download headers
import { CertificateTemplatesService } from './certificate-templates.service';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';

@Controller('certificate-templates')
export class CertificateTemplatesController {
  constructor(private readonly service: CertificateTemplatesService) {}

  @Post()
  create(@Body() createDto: CreateCertificateTemplateDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // --- NEW PDF GENERATION ENDPOINT ---
  @Get('generate/:templateId/:userId')
  async generateCertificate(
    @Param('templateId') templateId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.service.generatePdf(templateId, userId);

      const filename = `certificate_${userId}.pdf`;

      // Set headers for automatic browser download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      });

      return res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate certificate',
        error: error.message,
      });
    }
  }
  // -----------------------------------

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCertificateTemplateDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
