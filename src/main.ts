import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (raw) {
    return raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  const origins = [
    'https://macplus.by',
    'https://www.macplus.by',
    'https://admin.macplus.by',
  ];
  if (process.env.NODE_ENV !== 'prod') {
    origins.push(
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      'http://localhost:5001',
      'http://127.0.0.1:5001',
    );
  }

  return origins;
}

async function bootstrap() {
  const PORT = process.env.PORT || 5001;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', process.env.TRUST_PROXY || 1);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const corsOrigins = getCorsOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  });
  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
bootstrap();
