import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export type CartItemDocument = CartItem & Document;

@Schema()
export class CartItem {
  @Prop()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @Prop()
  @IsNumber()
  @IsNotEmpty()
  count: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
