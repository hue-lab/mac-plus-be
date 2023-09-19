import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {CategorySchema} from "./schema/category.schema";

@Module({
  providers: [CategoryService],
  controllers: [CategoryController],
  imports: [
    MongooseModule.forFeature([
      {name: 'Category', schema: CategorySchema}
    ])
  ]
})
export class CategoryModule {}
