import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SketchModule } from './sketch/sketch.module';

@Module({
  imports: [SketchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
