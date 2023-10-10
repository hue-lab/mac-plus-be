import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { FieldType } from "../enums/fieldType.enum";

export type FieldDocument = Field & Document;

@Schema()
export class Field {
  @Prop({type: String, unique: true, required: true})
  code!: string;

  @Prop({type: String, enum: FieldType})
  type: FieldType;

  @Prop({type: String || [String]})
  value: string | string[];
}

export const FieldSchema = SchemaFactory.createForClass(Field);
