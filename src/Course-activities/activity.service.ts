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
import * as https from 'https';

@Injectable()
export class ActivityService {
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 10000, // Keep connection open longer
    family: 4, // Force IPv4 to prevent IPv6 timeout errors
    maxSockets: 5, // Don't overwhelm the local network stack
    // @ts-ignore
    insecureHTTPParser: true,
  });
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

  async migrateH5PFromCsv(fileBuffer: Buffer, scorm: boolean) {
    if (!fileBuffer || fileBuffer.length === 0) throw new Error('CSV is empty');

    // Trigger detached background process
    setImmediate(() => {
      this.runBackgroundMigrationContext(fileBuffer, scorm).catch((err) =>
        this.logger.error('💥 CRITICAL BACKGROUND CRASH', err),
      );
    });

    return {
      status: 'processing',
      message: 'Migration is running. Monitor logs for [Progress] updates.',
    };
  }

  private async runBackgroundMigrationContext(
    fileBuffer: Buffer,
    scorm: boolean,
  ) {
    const rows: any[] = [];
    const stream = Readable.from(fileBuffer);

    try {
      this.logger.log('📂 Parsing CSV...');
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data) => rows.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      this.logger.log(
        `✅ Parsed ${rows.length} rows. Starting 1-hour migration loop...`,
      );
      await this.processMigrationRows(rows, scorm);
    } catch (error) {
      this.logger.error(`❌ Parsing failed: ${error.message}`);
    }
  }

  // activity.service.ts

  private async processMigrationRows(rows: any[], scorm: boolean) {
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0; // Track skipped items
    const total = rows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const activityId = row['new_activity_id'];
      const url = row['content'];

      if (!activityId || !url) continue;

      try {
        await this.retryWithBackoff(async () => {
          // 1. Check DB for existing content
          const activity = await this.prisma.course.activity.findUnique({
            where: { id: activityId },
            select: { id: true, content: true },
          });

          if (!activity) {
            throw new Error(`Activity ${activityId} missing in DB`);
          }

          // --- SKIP LOGIC ---
          // Check if content exists and looks like a URL
          if (activity.content && activity.content.startsWith('http')) {
            this.logger.log(
              `⏭️ Skipping [${activityId}]: Content already exists.`,
            );
            skipCount++;
            return; // Exit the retryWithBackoff callback
          }

          // 2. Download
          const h5pBuffer = await this.downloadFile(url);

          // 3. Extract and Upload (Throttled internally in MinioService)

          const uploadResult = scorm
            ? await this.h5pService.uploadScormExtract(
                h5pBuffer,
                'migration.zip',
                activityId,
              )
            : await this.h5pService.uploadH5PExtract(
                h5pBuffer,
                'migration.h5p',
                activityId,
              );

          // 4. Update Database
          await this.prisma.course.activity.update({
            where: { id: activityId },
            data: {
              content: uploadResult.playerUrl,
            },
          });

          successCount++;
        });
      } catch (error: any) {
        failCount++;
        this.logger.error(
          `❌ Permanent Failure [${activityId}]: ${error.message}`,
        );
      }

      rows[i] = null; // Memory management

      if ((i + 1) % 5 === 0 || i === total - 1) {
        this.logStatus(
          i + 1,
          total,
          startTime,
          successCount,
          failCount,
          skipCount,
        );
      }

      // 8-second delay to prevent Cloudflare/IP bans
      await new Promise((res) => setTimeout(res, 8000));
    }

    this.logger.log(
      `🏁 Migration Finished. S: ${successCount} | F: ${failCount} | Skipped: ${skipCount}`,
    );
  }

  // Updated Log Status to include skips
  private logStatus(
    curr: number,
    total: number,
    start: number,
    s: number,
    f: number,
    skip: number,
  ) {
    const elapsed = Date.now() - start;
    const avgPerItem = elapsed / curr;
    const remainingMin = Math.round(((total - curr) * avgPerItem) / 60000);
    const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    this.logger.log(
      `📊 [Progress] ${curr}/${total} | Success: ${s} | Fail: ${f} | Skip: ${skip} | ETA: ${remainingMin}m | RAM: ${memory}MB`,
    );
  }

  private async retryWithBackoff(fn: () => Promise<any>, retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        const isNetworkError =
          err.message.includes('429') ||
          err.code === 'ETIMEDOUT' ||
          err.message.includes('timeout');

        if (isNetworkError && i < retries - 1) {
          const delay = Math.pow(2, i) * 3000 + Math.random() * 1000;
          this.logger.warn(
            `⚠️ Retry ${i + 1}/${retries} in ${Math.round(delay)}ms due to network...`,
          );
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }
        throw err;
      }
    }
  }

  private async downloadFile(url: string): Promise<Buffer> {
    const config: any = {
      responseType: 'arraybuffer',
      timeout: 300000, // 5 minute timeout for huge files
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      httpsAgent: this.httpsAgent,
      insecureHTTPParser: true,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Migration-Bot/1.1',
      },
    };

    const response = await axios.get<ArrayBuffer>(url, config);
    return Buffer.from(response.data);
  }
}
