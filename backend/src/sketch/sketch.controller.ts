import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SketchService } from './sketch.service';
import { fal } from '@fal-ai/client';

@Controller('sketch')
export class SketchController {
  constructor(private readonly sketchService: SketchService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.sketchService.handleUploadedImage(file);
  }
}
