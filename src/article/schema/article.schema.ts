import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SeoDTO } from '../../shared/dto/seo.dto';

export type ArticleDocument = Article & Document;

@Schema({ timestamps: true })
export class Article {
  @Prop({ type: String })
  media: string;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: Boolean })
  isSlide: boolean;

  @Prop({ type: Boolean })
  hidden: boolean;

  @Prop({ type: String })
  slideTitle: string;

  @Prop({ type: String })
  slideDescription: string;

  @Prop({ type: String })
  slideLink: string;

  @Prop()
  seo?: SeoDTO;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
