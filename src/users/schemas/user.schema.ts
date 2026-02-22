import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['CREATOR', 'EVENTEE'], required: true })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
