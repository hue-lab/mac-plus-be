import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {SchemaTypes} from "mongoose";

export type DiscountConfigDocument = DiscountConfig & Document;

@Schema({ capped: { max: 1, size: 100 }, autoCreate: true})
export class DiscountConfig {
  @Prop({ type: Number })
  minCount: number;

  @Prop({ type: Number })
  discount: number;

  @Prop({ type: Number })
  fixPriceMinCount: number;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Category' })
  fixPriceCategories: string[];

  @Prop({ type: Number })
  fixPrice: number;
}


export const DiscountConfigSchema = SchemaFactory.createForClass(DiscountConfig)
