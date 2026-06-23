import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { path } from 'app-root-path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const PORT = process.env.PORT || 5001;
  // const httpsOptions = {
  //   key: fs.readFileSync(`${path}/certs/properfumer.key`, 'utf-8'),
  //   cert: fs.readFileSync(`${path}/certs/properfumer.crt`, 'utf-8'),
  // };

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', process.env.TRUST_PROXY || 1);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
bootstrap();
