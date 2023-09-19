import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {StateColor} from "../../enums/stateColor.enum";

export type OrderStateDocument = OrderState & Document;

@Schema()
export class OrderState {
  @Prop()
  label: string;

  @Prop({type: String, enum: StateColor})
  color: StateColor;

  @Prop()
  description?: string;
}

export const OrderStateSchema = SchemaFactory.createForClass(OrderState);
