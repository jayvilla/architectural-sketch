// sketch.controller.ts
// -----------------------------------------------------------------------------
// High-level purpose:
// Exposes REST endpoints for the image → sketch transformation pipeline.
// This controller acts as a thin boundary layer that:
//   • Validates inbound requests at the transport layer
//   • Accepts multipart uploads via Multer
//   • Delegates actual image processing to SketchService
//
// Design:
// - Keep controller slim: no business logic, orchestration, or transformations.
// - Provide explicit endpoints and clear IO shapes for predictable integration.
// -----------------------------------------------------------------------------

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SketchService } from './sketch.service';

@Controller('sketch')
export class SketchController {
  constructor(private readonly sketchService: SketchService) {}

  /**
   * POST /sketch/upload
   * ---------------------------------------------------------------------------
   * Accepts a single image upload and forwards it to the SketchService for
   * end-to-end processing (cleaning + sketch generation).
   *
   * Request:
   *   FormData:
   *     - image: File (required)
   *
   * Response:
   *   {
   *     message: string,
   *     cleanedUrl: string,
   *     sketchUrl: string
   *   }
   *
   * Failure Modes:
   *   - Missing file -> 400
   *   - Inpainting/sketch generation errors -> bubbled from service layer
   *   - Model failures or malformed upstream response
   *
   * Notes:
   *   - Controller explicitly checks file presence to give predictable errors.
   *   - The FileInterceptor handles parsing multipart/form-data bodies.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      // Surface a clear transport-level error before touching the service layer
      throw new BadRequestException('Image file is required');
    }

    // Delegates business logic to service. Controller remains thin and stateless.
    return this.sketchService.handleUploadedImage(file);
  }
}
