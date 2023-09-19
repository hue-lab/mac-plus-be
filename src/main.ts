import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import * as fs from "fs";
import {path} from 'app-root-path';

async function bootstrap() {
  const PORT = process.env.PORT || 5001
  // const httpsOptions = {
  //   key: fs.readFileSync(`${path}/certs/properfumer.key`, 'utf-8'),
  //   cert: fs.readFileSync(`${path}/certs/properfumer.crt`, 'utf-8'),
  // };

  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
}
bootstrap();
