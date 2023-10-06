import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import * as autoPopulate from 'mongoose-autopopulate';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String})
  handle: string;

  @Prop({ type: String})
  description?: string;

  @Prop({ type: () => [String] })
  media: string[];

  @Prop([{ type: SchemaTypes.ObjectId, ref: Category.name, autopopulate: true }])
  children?: Category[];

  @Prop({ type: String})
  productTypeId?: string;

  @Prop({ type: Boolean })
  root?: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.plugin<any>(autoPopulate);