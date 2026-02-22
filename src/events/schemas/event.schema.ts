import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true }) title: string;
  @Prop() description: string;
  @Prop({ required: true }) date: Date;
  @Prop({ required: true }) creatorId: string; // store the JWT userId
  @Prop() shareUrl: string; // optional, will generate after event creation
  @Prop({ type: Number, default: 1 }) creatorReminderDaysBefore: number; // e.g., 1 = 1 day before
  @Prop({ type: Number, default: 1 }) userReminderDaysBefore: number;


}

export const EventSchema = SchemaFactory.createForClass(Event);
