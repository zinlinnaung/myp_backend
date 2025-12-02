import {
  Controller,
  Post,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MinioService } from './minio.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly minioService: MinioService) {}

  /**
   * Upload private image
   */
  @Post('upload-private')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folder: { type: 'string', example: 'avatars' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['folder', 'file'],
    },
  })
  async uploadPrivate(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string,
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (!folder) throw new BadRequestException('Folder is required');

    return this.minioService.uploadImagePrivate(
      file.buffer,
      file.originalname,
      folder,
    );
  }

  /**
   * Download private file using temporary key
   */
  @Get('download')
  async downloadPrivateFile(
    @Query('path') path: string,
    @Query('key') key: string,
    @Res() res: Response,
  ) {
    if (!path || !key) return res.status(400).send('Missing path or key');

    const decodedPath = decodeURIComponent(path);
    const record = await this.minioService.validateTempKey(key);

    if (
      !record ||
      record.objectName !== decodedPath ||
      record.expiresAt < Date.now()
    ) {
      return res.status(403).send('Invalid or expired key');
    }

    try {
      const objectStream = await this.minioService.getObjectStream(decodedPath);

      // Set headers before piping
      res.attachment(decodedPath.split('/').pop() || 'file');
      res.setHeader('Content-Type', 'application/octet-stream');

      objectStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        if (!res.headersSent) res.status(500).send('Error downloading file');
      });

      objectStream.pipe(res);
    } catch (err) {
      console.error('Error fetching object:', err);
      res.status(500).send('Error downloading file');
    }
  }
}
