import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cors());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(8000);
  console.log('Backend running on http://localhost:8000');
}
bootstrap();
