import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from "mongoose";

export type DeliveryMethodDocument = DeliveryMethod & Document;

@Schema({timestamps: true})
export class DeliveryMethod {
  @Prop({type: String})
  name: string;

  @Prop({type: String})
  description: string;

  @Prop({type: () => [String]})
  fields: string[];

  @Prop({type: [mongoose.Schema.Types.ObjectId], ref: 'PaymentMethod'})
  paymentMethods: mongoose.Schema.Types.ObjectId[];
}

export const DeliveryMethodSchema = SchemaFactory.createForClass(DeliveryMethod);
