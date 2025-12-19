import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FeedbackTemplateService } from './feedback-template.service';
import {
  CreateFeedbackTemplateDto,
  UpdateFeedbackTemplateDto,
} from './feedback-template.dto';

@Controller('feedback-templates')
export class FeedbackTemplateController {
  constructor(
    private readonly feedbackTemplateService: FeedbackTemplateService,
  ) {}

  /**
   * CREATE: Save a new feedback template
   * POST /feedback-templates
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateFeedbackTemplateDto) {
    return await this.feedbackTemplateService.create(createDto);
  }

  /**
   * READ ALL: Get all active templates
   * GET /feedback-templates
   */
  @Get()
  async findAll() {
    return await this.feedbackTemplateService.findAll();
  }

  /**
   * READ ONE: Get a specific template by ID
   * GET /feedback-templates/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.feedbackTemplateService.findOne(id);
  }

  /**
   * UPDATE: Modify an existing template
   * PATCH /feedback-templates/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFeedbackTemplateDto,
  ) {
    return await this.feedbackTemplateService.update(id, updateDto);
  }

  /**
   * DELETE: Soft delete a template
   * DELETE /feedback-templates/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.feedbackTemplateService.remove(id);
  }
}
