import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Prisma } from 'generated/course';
import { Readable } from 'stream';
import { MinioService } from 'src/Minio/minio.service';
import * as csv from 'csv-parser';
import axios from 'axios';
import pLimit from 'p-limit';

@Injectable()
export class ActivityService {
  constructor(
    private prisma: PrismaService,
    private h5pService: MinioService,
  ) {}

  private readonly logger = new Logger(ActivityService.name);

  async create(dto: CreateActivityDto) {
    return this.prisma.course.activity.create({
      data: {
        title: dto.title,
        type: dto.type,
        content: dto.content,
        order: dto.order,
        description: dto.description,
        sectionId: dto.sectionId,
      },
    });
  }

  async findAll() {
    return this.prisma.course.activity.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.course.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async update(id: string, dto: UpdateActivityDto) {
    await this.findOne(id);

    return this.prisma.course.activity.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.course.activity.delete({
      where: { id },
    });
  }

  async migrateH5PFromCsv(fileBuffer: Buffer) {
    const results: any[] = [];
    const stream = Readable.from(fileBuffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const report = await this.processMigrationRows(results);
            resolve({
              message: 'Batch processing completed',
              totalRows: results.length,
              ...report,
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => reject(error));
    });
  }

  private async processMigrationRows(rows: any[]) {
    const CONCURRENCY_LIMIT = 5; // Adjust based on your server RAM (e.g., 3-10)
    const limit = pLimit(CONCURRENCY_LIMIT);

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Map rows to a list of "tasks"
    const tasks = rows.map((row) =>
      limit(async () => {
        const newActivityId = row['new_activity_id'];
        const downloadUrl = row['content'];

        if (!newActivityId || !downloadUrl) {
          return; // Skip invalid rows
        }

        try {
          // 1. Database Check (Fast)
          const activity = await this.prisma.course.activity.findUnique({
            where: { id: newActivityId },
            select: { id: true }, // Only select ID to save memory
          });

          if (!activity) throw new Error(`Activity ${newActivityId} not found`);

          // 2. Download (I/O intensive)
          const fileBuffer = await this.downloadFile(downloadUrl);

          // 3. Upload & Extract (CPU/Network intensive)
          const uploadResult = await this.h5pService.uploadH5PExtract(
            fileBuffer,
            'migration.h5p',
            newActivityId,
          );

          // 4. Update DB
          await this.prisma.course.activity.update({
            where: { id: newActivityId },
            data: {
              content: uploadResult.playerUrl,
              type: 'H5P',
            },
          });

          successCount++;
          this.logger.log(`✅ Migrated: ${newActivityId}`);
        } catch (error: any) {
          failCount++;
          errors.push({ id: newActivityId, error: error.message });
          this.logger.error(`❌ Failed: ${newActivityId} - ${error.message}`);
        }
      }),
    );

    // Wait for all tasks in the limit pool to finish
    await Promise.all(tasks);

    return { successCount, failCount, errors };
  }

  private async downloadFile(url: string): Promise<Buffer> {
    try {
      // FIX: Cast the configuration object to 'any' to bypass TS validation
      const config: any = {
        responseType: 'arraybuffer',
        timeout: 60000,
        insecureHTTPParser: true, // This will now be accepted
      };

      const response = await axios.get<ArrayBuffer>(url, config);

      return Buffer.from(response.data);
    } catch (error: any) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }
}
