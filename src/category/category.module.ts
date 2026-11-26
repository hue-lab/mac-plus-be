import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './schema/category.schema';
import { CatalogueSeoModule } from '../product/catalogue-seo.module';

@Module({
  providers: [CategoryService],
  controllers: [CategoryController],
  imports: [
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    CatalogueSeoModule,
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
