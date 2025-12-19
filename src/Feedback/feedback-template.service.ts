import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateFeedbackTemplateDto,
  UpdateFeedbackTemplateDto,
} from './feedback-template.dto';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

@Injectable()
export class FeedbackTemplateService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFeedbackTemplateDto) {
    // You MUST provide id and updated_at manually here
    return this.prisma.course.feedback_templates.create({
      data: {
        id: uuidv4(), // Fixes missing id error
        name: dto.name,
        description: dto.description,
        content: dto.content as Prisma.JsonArray,
        updated_at: new Date(), // Fixes missing updated_at error
        created_at: new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.course.feedback_templates.findMany({
      where: { isDeleted: false },
      orderBy: { created_at: 'desc' }, // Use created_at to match your model
    });
  }

  async findOne(id: string) {
    // Corrected to use the nested 'course' property
    const template = await this.prisma.course.feedback_templates.findUnique({
      where: { id },
    });

    if (!template || template.isDeleted)
      throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, dto: UpdateFeedbackTemplateDto) {
    return this.prisma.course.feedback_templates.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        content: dto.content as Prisma.JsonArray,
        updated_at: new Date(), // Manually refreshing the update timestamp
      },
    });
  }

  async remove(id: string) {
    // Soft delete logic
    return this.prisma.course.feedback_templates.update({
      where: { id },
      data: {
        isDeleted: true,
        updated_at: new Date(),
      },
    });
  }
}
