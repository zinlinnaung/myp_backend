import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path to your Prisma service
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';

@Injectable()
export class CertificateTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCertificateTemplateDto) {
    return this.prisma.course.certificate_templates.create({
      data: {
        ...data,
        updated_at: new Date().toISOString(),
      },
    });
  }

  async findAll() {
    return this.prisma.course.certificate_templates.findMany();
  }

  async findOne(id: string) {
    const template = await this.prisma.course.certificate_templates.findUnique({
      where: { id },
    });
    if (!template)
      throw new NotFoundException(`Template with ID ${id} not found`);
    return template;
  }

  async update(id: string, data: UpdateCertificateTemplateDto) {
    return this.prisma.course.certificate_templates.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.course.certificate_templates.delete({
      where: { id },
    });
  }
}
