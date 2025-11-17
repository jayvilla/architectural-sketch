import { BadRequestException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SketchService {
  private readonly logger = new Logger(SketchService.name);

  async handleUploadedImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    this.logger.log(
      `Received file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`,
    );

    // In Phase 3+, this is where we'll call Fal.ai for inpainting/sketching.
    return {
      message: 'Image received successfully',
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
