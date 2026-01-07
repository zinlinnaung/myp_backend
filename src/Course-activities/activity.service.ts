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
    const rows: any[] = [];
    const stream = Readable.from(fileBuffer);

    // 1. Fast CSV Parsing
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // 2. Trigger background process - NO AWAIT
    this.processMigrationRows(rows).catch((err) =>
      this.logger.error('Background migration crashed', err),
    );

    // 3. Return immediately to Controller
    return {
      status: 'processing',
      message:
        'Migration is running in the background. Check logs for progress.',
      totalRows: rows.length,
    };
  }

  private async processMigrationRows(rows: any[]) {
    // STRICT CONCURRENCY: Set to 1 or 2 because the source server is aggressive with 429s
    const limit = pLimit(1);
    let successCount = 0;
    let failCount = 0;

    const tasks = rows.map((row) =>
      limit(async () => {
        const id = row['new_activity_id'];
        const url = row['content'];
        if (!id || !url) return;

        try {
          await this.retryWithBackoff(async () => {
            // 1. Verify Activity exists
            const activity = await this.prisma.course.activity.findUnique({
              where: { id },
              select: { id: true },
            });
            if (!activity) throw new Error(`Activity ${id} not found`);

            // 2. Resilient Download
            const fileBuffer = await this.downloadFile(url);

            // 3. Extract and Upload
            const uploadResult = await this.h5pService.uploadH5PExtract(
              fileBuffer,
              'migration.h5p',
              id,
            );

            // 4. Final DB Update
            await this.prisma.course.activity.update({
              where: { id },
              data: {
                content: uploadResult.playerUrl,
                type: 'H5P',
              },
            });
          });

          successCount++;
          this.logger.log(
            `✅ [${successCount}/${rows.length}] Migrated: ${id}`,
          );

          // COOL DOWN: Wait 2 seconds between successful rows to avoid IP ban
          await new Promise((res) => setTimeout(res, 2000));
        } catch (error: any) {
          failCount++;
          this.logger.error(`❌ Permanent Failure: ${id} - ${error.message}`);
        }
      }),
    );

    await Promise.all(tasks);
    this.logger.log(
      `🏁 Migration Finished. Success: ${successCount}, Failed: ${failCount}`,
    );
  }

  private async retryWithBackoff(fn: () => Promise<any>, retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        const is429 = err.message.includes('429');
        const isTimeout =
          err.code === 'ETIMEDOUT' || err.message.includes('timeout');

        if ((is429 || isTimeout) && i < retries - 1) {
          // Exponential Backoff + Jitter (randomness) to break the 429 cycle
          const jitter = Math.floor(Math.random() * 3000);
          const delay = Math.pow(2, i) * 5000 + jitter;

          this.logger.warn(
            `Network Error (${is429 ? '429' : 'Timeout'}). Retrying in ${delay}ms...`,
          );
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }
        throw err;
      }
    }
  }

  private async downloadFile(url: string): Promise<Buffer> {
    try {
      const config: any = {
        responseType: 'arraybuffer',
        // Increased timeout to 5 minutes for those 87MB+ files
        timeout: 300000,
        insecureHTTPParser: true,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Migration-Bot/1.0',
        },
      };

      const response = await axios.get<ArrayBuffer>(url, config);
      return Buffer.from(response.data);
    } catch (error: any) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }
}
