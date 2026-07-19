import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenSessionDocument = RefreshTokenSession & Document;

@Schema({ timestamps: true })
export class RefreshTokenSession {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, index: true })
  familyId: string;

  @Prop({ type: String, required: true, unique: true })
  jti: string;

  @Prop({ type: String, required: true, unique: true })
  tokenHash: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String })
  ip?: string;

  @Prop({ type: Date, required: true, index: true })
  expiresAt: Date;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop({ type: Date })
  usedAt?: Date;

  @Prop({ type: String })
  replacedByJti?: string;
}

export const RefreshTokenSessionSchema = SchemaFactory.createForClass(
  RefreshTokenSession,
);
