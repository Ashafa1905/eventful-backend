import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reference: string; // Paystack reference

  @Prop({ default: 'pending' })
  status: string; // pending | success | failed
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
