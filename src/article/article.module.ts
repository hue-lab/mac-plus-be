import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {ArticleSchema} from "./schema/article.schema";

@Module({
  providers: [ArticleService],
  controllers: [ArticleController],
  imports: [
    MongooseModule.forFeature([
      {name: 'Article', schema: ArticleSchema}
    ])
  ]
})
export class ArticleModule {}
