import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {ProductTypePropertyType} from "../../enums/productTypePropertyType.enum.";

export type ProductTypePropertyDocument = ProductTypeProperty & Document;

@Schema()
export class ProductTypeProperty {
  @Prop({type: Boolean})
  showCard: boolean;

  @Prop({type: Boolean})
  showFilter: boolean;

  @Prop({type: String})
  name: string;

  @Prop({type: String})
  description?: string;

  @Prop({type: String})
  units?: string;

  @Prop({type: String, enum: ProductTypePropertyType })
  type: ProductTypePropertyType;

  @Prop({type: () => [String] || [Number]})
  options?: string[] | number[];
}

export const ProductTypePropertySchema = SchemaFactory.createForClass(ProductTypeProperty);
