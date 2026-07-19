import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

function getTrustProxy(): boolean | number | string {
  const raw = process.env.TRUST_PROXY;
  if (!raw) {
    return 1;
  }

  if (raw === 'true' || raw === 'false') {
    return raw === 'true';
  }

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  return raw;
}

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
  app.set('trust proxy', getTrustProxy());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
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
