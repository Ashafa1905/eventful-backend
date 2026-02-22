import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Ticket extends Document {
  @Prop({ required: true }) eventId: string;   // Event this ticket belongs to
  @Prop({ required: true }) userId: string;    // User who owns the ticket
  @Prop({ required: true }) qrData: string;    // Unique QR string
  @Prop({ type: Number, default: 1 })
  reminderDaysBefore: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
