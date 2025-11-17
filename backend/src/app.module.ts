import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SketchModule } from './sketch/sketch.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SketchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
