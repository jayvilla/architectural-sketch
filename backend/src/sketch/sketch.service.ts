import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { fal } from '@fal-ai/client';

@Injectable()
export class SketchService {
  private readonly logger = new Logger(SketchService.name);

  constructor() {
    // Set Fal.ai API key
    fal.config({
      credentials: process.env.FAL_KEY!,
    });
  }

  /**
   * Phase 2 — accept upload
   */
  async handleUploadedImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    this.logger.log(
      `Received file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`,
    );

    // → Phase 3: call inpainting
    const cleanedUrl = await this.inpaintImage(file);

    return {
      message: 'Image cleaned successfully',
      cleanedUrl,
    };
  }

  /**
   * Phase 3 — Inpainting step using Fal.ai
   */
  async inpaintImage(file: Express.Multer.File): Promise<string> {
    try {
      // Fix: convert Node buffer → Uint8Array → Web File
      const uint8 = new Uint8Array(file.buffer);
      const webFile = new File([uint8], file.originalname, {
        type: file.mimetype,
      });

      // Upload → returns a string URL
      const imageUrl: string = await fal.storage.upload(webFile);

      // Call the model (Kontext requires image_url)
      const result = await fal.run<any>('fal-ai/flux-pro/kontext', {
        input: {
          image_url: imageUrl,
          prompt:
            'Remove cars, trees, people, signs, poles, shadows, and other obstructions.',
        },
      });

      // Output handling
      const outputUrl =
        result?.data?.images?.[0]?.url || result?.data?.image?.url;

      if (!outputUrl) {
        throw new Error('No cleaned image returned');
      }

      return outputUrl;
    } catch (err) {
      this.logger.error('Inpainting failed', err);
      throw new BadRequestException('Fal.ai inpainting failed');
    }
  }
}
