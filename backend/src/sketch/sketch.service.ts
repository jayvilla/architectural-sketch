// sketch.service.ts
// -----------------------------------------------------------------------------
// High-level purpose:
// This service handles the full image-processing pipeline for converting a
// user-uploaded building photo into a clean, architectural-style sketch.
//
// Pipeline Overview:
//   • Accept upload
//   • Upload to Fal.ai storage
//   • Run obstruction removal (inpainting)
//   • Generate architectural sketch
//
// Notes:
// - Fal.ai requires browser-compatible File objects for uploads
// - Output URLs are returned for immediate frontend rendering or download
// - Model selection can be swapped without modifying orchestration logic
// -----------------------------------------------------------------------------

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { fal } from '@fal-ai/client';

@Injectable()
export class SketchService {
  private readonly logger = new Logger(SketchService.name);

  constructor() {
    // -------------------------------------------------------------------------
    // Initialize Fal.ai API credentials.
    // Ensures that the client is configured when the service is instantiated.
    // Missing credentials fail fast during app startup.
    // -------------------------------------------------------------------------
    fal.config({
      credentials: process.env.FAL_KEY!,
    });
  }

  /**
   * handleUploadedImage
   * ---------------------------------------------------------------------------
   * Top-level orchestrator for the entire image-processing workflow.
   *
   * Responsibilities:
   *   - Validate the uploaded file
   *   - Inpaint/clean the source image
   *   - Generate a sketch version from cleaned output
   *   - Return canonical URLs suitable for frontend consumption
   *
   * This keeps high-level flow declarative while delegating the actual
   * processing steps to smaller, testable helper methods.
   */
  async handleUploadedImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    this.logger.log(
      `Received file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`,
    );

    const cleanedUrl = await this.inpaintImage(file);
    const sketchUrl = await this.generateSketch(cleanedUrl);

    return {
      message: 'Sketch generated successfully',
      cleanedUrl,
      sketchUrl,
    };
  }

  /**
   * inpaintImage
   * ---------------------------------------------------------------------------
   * Removes obstructions from the uploaded image using a Fal.ai model.
   *
   * Responsibilities:
   *   - Convert Multer's file buffer → Web File (Fal requires browser-native File)
   *   - Upload source image to Fal's storage (returns a public CDN URL)
   *   - Call inpainting endpoint with a quality prompt
   *   - Normalize Fal's output structure to extract a usable final image URL
   *
   * Includes robust error-handling and logging for easier debugging of model,
   * upload, or response-shape issues.
   */
  async inpaintImage(file: Express.Multer.File): Promise<string> {
    try {
      // Convert raw buffer from Multer → Web File (required by Fal storage API)
      const uint8 = new Uint8Array(file.buffer);
      const webFile = new File([uint8], file.originalname, {
        type: file.mimetype,
      });

      // Upload original image; Fal returns a globally accessible URL
      const imageUrl: string = await fal.storage.upload(webFile);

      // Trigger inpainting model execution
      const result = await fal.run<any>('fal-ai/flux-pro/kontext', {
        input: {
          image_url: imageUrl,
          prompt:
            'Remove cars, trees, people, signs, poles, shadows, and other obstructions.',
        },
      });

      // Fal sometimes returns either images[] or a single image object
      const outputUrl =
        result?.data?.images?.[0]?.url || result?.data?.image?.url;

      if (!outputUrl) {
        throw new Error('Fal.ai returned no inpainted image result.');
      }

      return outputUrl;
    } catch (err) {
      this.logger.error('Inpainting failed', err);
      throw new BadRequestException('Fal.ai inpainting failed');
    }
  }

  /**
   * generateSketch
   * ---------------------------------------------------------------------------
   * Produces a clean architectural pencil-style sketch from a processed image.
   *
   * Responsibilities:
   *   - Call sketch model with descriptive prompt
   *   - Normalize output to a single usable URL
   *
   * The prompt is tuned for line-art architectural accuracy with minimal shading.
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
        throw new Error('Fal.ai returned no sketch output.');
      }

      return sketchUrl;
    } catch (err) {
      this.logger.error('Sketch generation failed', err);
      throw new BadRequestException('Fal.ai sketch generation failed');
    }
  }
}
