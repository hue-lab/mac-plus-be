import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuSchema } from './schema/menu.schema';
import { MenuController } from './menu.controller';

@Module({
  providers: [MenuService],
  controllers: [MenuController],
  imports: [MongooseModule.forFeature([{ name: 'Menu', schema: MenuSchema }])],
})
export class MenuModule {}
