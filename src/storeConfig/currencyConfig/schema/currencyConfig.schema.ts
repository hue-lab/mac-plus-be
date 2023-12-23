import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CurrencyConfigDocument = CurrencyConfig & Document;

@Schema({ capped: { max: 1, size: 100 }, autoCreate: true })
export class CurrencyConfig {
  @Prop({ type: Number })
  currency: number;
}

export const CurrencyConfigSchema =
  SchemaFactory.createForClass(CurrencyConfig);
