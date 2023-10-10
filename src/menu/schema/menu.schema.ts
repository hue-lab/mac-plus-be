import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import * as autoPopulate from 'mongoose-autopopulate';

export type MenuDocument = Menu & Document;

@Schema()
export class Menu {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  handle: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: () => [String] })
  media: string[];

  @Prop([{ type: SchemaTypes.ObjectId, ref: Menu.name, autopopulate: true }])
  children?: Menu[];

  @Prop({ type: String })
  productTypeId?: string;

  @Prop({ type: Boolean })
  root?: boolean;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
MenuSchema.plugin<any>(autoPopulate);
