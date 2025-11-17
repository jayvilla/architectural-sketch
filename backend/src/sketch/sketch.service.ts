import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { fal } from '@fal-ai/client';

@Injectable()
export class SketchService {
  private readonly logger = new Logger(SketchService.name);

  constructor() {
    // Configure Fal.ai API Key
    fal.config({
      credentials: process.env.FAL_KEY!,
    });
  }

  /**
   * PHASE 2 — Accept upload + run both phases (inpaint → sketch)
   */
  async handleUploadedImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    this.logger.log(
      `Received file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`,
    );

    // Phase 3: Clean the image
    const cleanedUrl = await this.inpaintImage(file);

    // Phase 4: Generate sketch from cleaned image
    const sketchUrl = await this.generateSketch(cleanedUrl);

    return {
      message: 'Sketch generated successfully',
      cleanedUrl,
      sketchUrl,
    };
  }

  /**
   * PHASE 3 — Inpainting using Fal.ai (Kontext)
   */
  async inpaintImage(file: Express.Multer.File): Promise<string> {
    try {
      // Convert Node buffer → Uint8Array → Web File
      const uint8 = new Uint8Array(file.buffer);
      const webFile = new File([uint8], file.originalname, {
        type: file.mimetype,
      });

      // Upload file → returns public URL
      const imageUrl: string = await fal.storage.upload(webFile);

      // Run Kontext inpainting model (requires image_url + prompt)
      const result = await fal.run<any>('fal-ai/flux-pro/kontext', {
        input: {
          image_url: imageUrl,
          prompt:
            'Remove cars, trees, people, signs, poles, shadows, and other obstructions.',
        },
      });

      const outputUrl =
        result?.data?.images?.[0]?.url || result?.data?.image?.url;

      if (!outputUrl) {
        throw new Error('No cleaned image returned from Fal.ai');
      }

      return outputUrl;
    } catch (err) {
      this.logger.error('Inpainting failed', err);
      throw new BadRequestException('Fal.ai inpainting failed');
    }
  }

  /**
   * PHASE 4 — Sketch Generation using ControlNet Sketch
   */
  async generateSketch(cleanedImageUrl: string): Promise<string> {
    try {
      const result = await fal.run<any>('fal-ai/flux-pro/kontext', {
        input: {
          image_url: cleanedImageUrl,
          prompt:
            'architectural pencil sketch, clean line drawing, building facade, no shading, sharp outlines',
        },
      });

      const sketchUrl =
        result?.data?.images?.[0]?.url || result?.data?.image?.url;

      if (!sketchUrl) {
        throw new Error('No sketch returned from Fal.ai');
      }

      return sketchUrl;
    } catch (err) {
      this.logger.error('Sketch generation failed', err);
      throw new BadRequestException('Fal.ai sketch generation failed');
    }
  }
}
