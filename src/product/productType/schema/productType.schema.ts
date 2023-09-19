import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {ProductTypeProperty} from "../../productTypeProperty/schema/ProductTypeProperty.schema";
import * as mongoose from "mongoose";

export type ProductTypeDocument = ProductType & Document;

@Schema()
export class ProductType {
  @Prop({type: String})
  name: string;

  @Prop({type: String})
  description?: string;

  @Prop({type: [mongoose.Schema.Types.ObjectId], ref: 'ProductTypeProperty'})
  properties: mongoose.Schema.Types.ObjectId[];
}

export const ProductTypeSchema = SchemaFactory.createForClass(ProductType);
