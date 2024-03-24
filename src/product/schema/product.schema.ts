import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { ProductProps } from './productProps.schema';
import { Brand } from '../brand/schema/brand.schema';
import { SeoDTO } from '../../shared/dto/seo.dto';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String })
  name: string;

  @Prop({ type: () => [String] })
  media: string[];

  @Prop({ type: Number })
  price: number;

  @Prop({ type: Number })
  priceUSD: number;

  @Prop({ type: Number })
  totalPrice: number;

  @Prop({ type: Number })
  discount: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Brand' })
  brand: Brand;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  content?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Category' })
  categoryId: string;

  @Prop({ type: String })
  productTypeId: string;

  @Prop({ type: Boolean })
  isNew: boolean;

  @Prop({ type: Boolean })
  isRec: boolean;

  @Prop({ type: Boolean })
  isStock: boolean;

  @Prop({ type: () => [ProductProps] })
  productProps: ProductProps[];

  @Prop({ type: () => SeoDTO })
  seo: SeoDTO;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
