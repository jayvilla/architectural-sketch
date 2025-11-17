import { Module } from '@nestjs/common';
import { SketchService } from './sketch.service';
import { SketchController } from './sketch.controller';

@Module({
  providers: [SketchService],
  controllers: [SketchController]
})
export class SketchModule {}
