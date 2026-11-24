import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { CatalogueSeoService } from './catalogue-seo.service';
import { Product, ProductSchema } from './schema/product.schema';
import { ProductType, ProductTypeSchema } from './productType/schema/productType.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Category.name, schema: CategorySchema },
    { name: Product.name, schema: ProductSchema },
    { name: ProductType.name, schema: ProductTypeSchema },
  ])],
  providers: [CatalogueSeoService],
  exports: [CatalogueSeoService],
})
export class CatalogueSeoModule {}
