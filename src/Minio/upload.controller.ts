import {
  Controller,
  Post,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles, // Import this for multiple files
  Res,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'; // Import FilesInterceptor
import { Response } from 'express';
import { MinioService } from './minio.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly minioService: MinioService) {}

  /**
   * NEW: Upload multiple files to public folder
   * Uploads to: dev/public/{folder_name}/...
   */
  @Post('upload-public-folder')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files')) // Note the plural 'Files'
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folder: {
          type: 'string',
          example: 'events/2023',
          description: 'Target folder path inside public',
        },
        files: {
          type: 'array', // Array type
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['folder', 'files'],
    },
  })
  async uploadPublicFolder(
    @UploadedFiles() files: Array<Express.Multer.File>, // Array of files
    @Body('folder') folder: string,
  ) {
    if (!files || files.length === 0)
      throw new BadRequestException('Files are required');
    if (!folder) throw new BadRequestException('Folder is required');

    // Map Multer files to the interface expected by service
    const bufferedFiles = files.map((file) => ({
      buffer: file.buffer,
      fileName: file.originalname,
    }));

    const urls = await this.minioService.uploadPublicFolder(
      bufferedFiles,
      folder,
    );

    return {
      message: 'Upload successful',
      folder: `public/${folder}`,
      count: urls.length,
      urls: urls,
    };
  }

  /**
   * Upload private image (Existing)
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

  @Post('upload-h5p')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        activityId: { type: 'string', example: '101' },
      },
      required: ['file', 'activityId'],
    },
  })
  async uploadH5P(
    @UploadedFile() file: Express.Multer.File,
    @Body('activityId') activityId: string,
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (!activityId) throw new BadRequestException('Activity ID is required');

    // Check file extension
    if (!file.originalname.endsWith('.h5p')) {
      throw new BadRequestException('Only .h5p files are allowed');
    }

    const result = await this.minioService.uploadH5PExtract(
      file.buffer,
      file.originalname,
      activityId,
    );

    return {
      message: 'H5P uploaded and extracted successfully',
      data: result,
    };
  }

  /**
   * Download private file using temporary key (Existing)
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
