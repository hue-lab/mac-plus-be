import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from "mongoose";

export type ProductTypePropertyOptionDocument = ProductTypePropertyOption & Document;

@Schema()
export class ProductTypePropertyOption {
  @Prop({ type: String})
  label?: string;

  @Prop({type: mongoose.Schema.Types.Mixed})
  value: string | number;
}

export const ProductTypePropertyOptionSchema = SchemaFactory.createForClass(ProductTypePropertyOption);
