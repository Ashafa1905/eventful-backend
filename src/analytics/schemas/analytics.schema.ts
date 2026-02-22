// src/analytics/schemas/analytics.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsDocument = Analytics & Document;

@Schema({ timestamps: true })
export class Analytics {
  @Prop({ required: true })
  eventId: string;

  @Prop({ default: 0 })
  totalAttendees: number;

  @Prop({ default: 0 })
  totalTicketsSold: number;

  @Prop({ default: 0 })
  totalQrScans: number;

  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop({ type: Map, of: Number, default: {} })
  ticketsSoldByChannel: Map<string, number>; // e.g., {"web": 10, "mobile": 5}

  @Prop({ type: Map, of: Number, default: {} })
  revenueByDay: Map<string, number>; // e.g., {"2026-02-16": 5000}
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);
