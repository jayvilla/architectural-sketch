import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow frontend (Next.js on 3000) to call backend (Nest on 3001)
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  await app.listen(8000);
  console.log(`Backend running on http://localhost:8000`);
}
bootstrap();
