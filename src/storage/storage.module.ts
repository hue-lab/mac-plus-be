import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { ServeStaticModule } from "@nestjs/serve-static";
import { path } from 'app-root-path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: `${path}/storage`,
      serveRoot: '/storage'
    })
  ],
  controllers: [StorageController],
  providers: [StorageService]
})
export class StorageModule {}
