import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";


export type ProductPropsDocument = ProductProps & Document;

@Schema()
export class ProductProps {
  @Prop({ type: String })
  productTypePropertyId: string;

  @Prop({type: String || [String] || Number || Boolean})
  value: string | string[] | number | boolean;
}

export const ProductPropsSchema = SchemaFactory.createForClass(ProductProps)
