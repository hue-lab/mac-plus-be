import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SeoDocument = Seo & Document;

@Schema()
export class Seo {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: () => [String] })
  keywords: string[];

  @Prop({ type: String })
  tag: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: String })
  url: string;
}

export const SeoSchema = SchemaFactory.createForClass(Seo);
