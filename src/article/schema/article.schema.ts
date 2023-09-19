import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema({timestamps: true})
export class Article {
  @Prop({type: String})
  media: string;

  @Prop({type: String})
  title?: string;

  @Prop({type: String})
  description: string;

  @Prop({type: String})
  content: string;

  @Prop({type: [String]})
  tags: string[];
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
