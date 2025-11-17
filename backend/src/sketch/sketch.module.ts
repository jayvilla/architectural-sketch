import { Module } from '@nestjs/common';
import { SketchService } from './sketch.service';
import { SketchController } from './sketch.controller';

@Module({
  controllers: [SketchController],
  providers: [SketchService],
})
export class SketchModule {}
