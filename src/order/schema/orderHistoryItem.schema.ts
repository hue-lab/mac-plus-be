import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {OrderHistoryEnum} from "../enums/orderHistory.enum";
import {Product} from "../../product/schema/product.schema";

export type OrderHistoryItemDocument = OrderHistoryItem & Document;

@Schema({timestamps: true})
export class OrderHistoryItem {
  @Prop({type: [String], enum: OrderHistoryEnum})
  type: OrderHistoryEnum;

  @Prop()
  details?: string;

  @Prop()
 time: number;

  @Prop({type: () => [Product]})
  products?: Product[]
}

export const OrderHistoryItemSchema = SchemaFactory.createForClass(OrderHistoryItem);
