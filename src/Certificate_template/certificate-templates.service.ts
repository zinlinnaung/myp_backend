import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path to your Prisma service
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';
import { jsPDF } from 'jspdf';
import { createCanvas, loadImage } from 'canvas';

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

  async generatePdf(templateId: string, userId: string): Promise<Buffer> {
    const template = await this.prisma.course.certificate_templates.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');

    const user = await this.prisma.user.user.findUnique({
      where: { id: userId },
    });
    const userName = user?.username || 'Student Name';

    // 1. Load Image to get ACTUAL dimensions
    const img = await loadImage(template.backgroundImage);
    const actualW = img.width;
    const actualH = img.height;

    // 2. Calculate Scaling Ratio
    // Your frontend canvas was 800 x 565
    const scaleX = actualW / 800;
    const scaleY = actualH / 565;

    // 3. Initialize PDF with actual image dimensions
    const pdf = new jsPDF({
      orientation: actualW > actualH ? 'l' : 'p',
      unit: 'px',
      format: [actualW, actualH],
    });

    // 4. Add Background Image first
    pdf.addImage(template.backgroundImage, 'PNG', 0, 0, actualW, actualH);

    // 5. Overlay Components with Scaling
    const components = (template.components as any).data;
    const currentDate = new Date().toLocaleDateString();

    components.forEach((comp) => {
      let text = '';
      if (comp.type === 'name') {
        text = userName;
      } else if (comp.type === 'date') {
        text = currentDate;
      }

      // SCALE THE COORDINATES
      const finalX = comp.position.x * scaleX;
      const finalY = comp.position.y * scaleY;

      // SCALE THE FONT SIZE
      // If 24px looked good on 800px width, scale it for the actual width
      const fontSize = 24 * scaleX;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(fontSize);
      pdf.setTextColor(0, 0, 0);

      // Draw text.
      // We add the fontSize to Y because jsPDF uses the baseline (bottom) of text
      pdf.text(text, finalX, finalY + fontSize);
    });

    return Buffer.from(pdf.output('arraybuffer'));
  }

  async remove(id: string) {
    return this.prisma.course.certificate_templates.delete({
      where: { id },
    });
  }
}
