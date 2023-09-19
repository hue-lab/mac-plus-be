import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {OrderState} from "../orderState/schema/orderState.schema";
import {PaymentMethod} from "../paymentMethod/schema/paymentMethod.schema";
import {CartItem} from "../../cart/schema/cartItem.schema";
import {OrderHistoryItem} from "./orderHistoryItem.schema";
import {DeliveryMethod} from "../deliveryMethod/schema/deliveryMethod.schema";

export type OrderDocument = Order & Document;

class Customer {
  @Prop({type: String})
  phone: string;

  @Prop({type: String})
  name: string;
}

class DeliveryMethodFieldValue {
  @Prop({type: String})
  name: string;

  @Prop({type: String})
  value: string;
}

class Delivery {
  @Prop()
  deliveryMethod: DeliveryMethod;

  @Prop({type: String})
  deliveryAddress: string;

  @Prop({type: () => [DeliveryMethodFieldValue]})
  deliveryData: DeliveryMethodFieldValue[];

  @Prop({type: String})
  comment?: string;
}

@Schema({timestamps: true})
export class Order {
  @Prop({type: String, unique: true, isRequired: true})
  orderCode: string;

  @Prop({type: () => Customer})
  customer: Customer;

  @Prop({type: () => OrderState})
  state: OrderState;

  @Prop({type: () => Delivery})
  delivery: Delivery;

  @Prop({type: () => PaymentMethod})
  paymentMethod: PaymentMethod;

  @Prop({type: () => [CartItem]})
  cartItems: CartItem[];

  @Prop({type: Number})
  subTotalPrice: number;

  @Prop({type: Number})
  totalPrice: number;

  @Prop({type: Number})
  totalDiscount: number;

  @Prop({type: () => [OrderHistoryItem]})
  historyList: OrderHistoryItem[]
}

export const OrderSchema = SchemaFactory.createForClass(Order);
