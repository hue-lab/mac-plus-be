import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema()
export class Brand {
  @Prop({type: String})
  name: string;

  @Prop({type: String})
  description?: string;

  @Prop({type: String})
  origin: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
