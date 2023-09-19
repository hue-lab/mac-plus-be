import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'src/auth/enums/role.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({type: String, required: true, unique: true})
  username: string;

  @Prop()
  email: string;

  @Prop({type: String, required: true})
  password: string;

  @Prop({type: [String], enum : Role, default: Role.Guest})
  roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
