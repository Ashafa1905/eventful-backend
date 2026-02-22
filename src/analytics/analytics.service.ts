import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';
import Redis from 'ioredis';
import moment from 'moment';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private redisClient: Redis;

  constructor(@InjectModel(Analytics.name) private analyticsModel: Model<AnalyticsDocument>) {
    this.redisClient = new Redis(); // default localhost:6379
  }

  /** Increment metrics after ticket purchase or QR scan */
  async incrementEventMetric(
    eventId: string,
    field: 'totalAttendees' | 'totalTicketsSold' | 'totalQrScans' | 'totalRevenue',
    value = 1,
    channel?: string, // optional for ticketsSoldByChannel
  ) {
    const update: any = { $inc: { [field]: value } };

    if (field === 'totalRevenue' && channel) {
      const dayKey = moment().format('YYYY-MM-DD');
      update.$inc[`revenueByDay.${dayKey}`] = value;
      update.$inc[`ticketsSoldByChannel.${channel}`] = 1;
    }

    const result = await this.analyticsModel.findOneAndUpdate(
      { eventId },
      update,
      { new: true, upsert: true },
    );

    // Cache per event
    await this.redisClient.set(
      `analytics:event:${eventId}`,
      JSON.stringify(result),
      'EX',
      3600,
    );

    // Invalidate overall cache to refresh next time
    await this.redisClient.del(`analytics:overall`);

    this.logger.log(`Updated ${field} for event ${eventId}`);
    return result;
  }

  /** Get analytics for a single event */
  async getEventAnalytics(eventId: string) {
    const cached = await this.redisClient.get(`analytics:event:${eventId}`);
    if (cached) return JSON.parse(cached);

    const analytics = await this.analyticsModel.findOne({ eventId });
    const defaultAnalytics = {
      eventId,
      totalAttendees: 0,
      totalTicketsSold: 0,
      totalQrScans: 0,
      totalRevenue: 0,
      ticketsSoldByChannel: {},
      revenueByDay: {},
    };

    const result = analytics || defaultAnalytics;

    await this.redisClient.set(
      `analytics:event:${eventId}`,
      JSON.stringify(result),
      'EX',
      3600,
    );

    return result;
  }

  /** Get overall analytics */
  async getOverallAnalytics() {
    const cached = await this.redisClient.get(`analytics:overall`);
    if (cached) return JSON.parse(cached);

    const stats = await this.analyticsModel.aggregate([
      {
        $group: {
          _id: null,
          totalAttendees: { $sum: '$totalAttendees' },
          totalTicketsSold: { $sum: '$totalTicketsSold' },
          totalQrScans: { $sum: '$totalQrScans' },
          totalRevenue: { $sum: '$totalRevenue' },
        },
      },
    ]);

    const result = stats[0] || {
      totalAttendees: 0,
      totalTicketsSold: 0,
      totalQrScans: 0,
      totalRevenue: 0,
    };

    await this.redisClient.set(
      `analytics:overall`,
      JSON.stringify(result),
      'EX',
      3600,
    );

    return result;
  }

  /** Revenue over time grouped by day/week/month */
  async getRevenueOverTime(
    eventId: string,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    const analytics = await this.getEventAnalytics(eventId);
    const revenueByDay = analytics.revenueByDay || {};

    const grouped: Record<string, number> = {};
    Object.keys(revenueByDay).forEach((date) => {
      const key =
        groupBy === 'day'
          ? date
          : groupBy === 'week'
          ? moment(date).startOf('week').format('YYYY-MM-DD')
          : moment(date).startOf('month').format('YYYY-MM-DD');

      grouped[key] = (grouped[key] || 0) + revenueByDay[date];
    });

    return grouped;
  }

  /** Tickets sold by channel for an event */
  async getTicketsSoldByChannel(eventId: string) {
    const analytics = await this.getEventAnalytics(eventId);
    return analytics.ticketsSoldByChannel || {};
  }

  /** Attendees over time */
  async getAttendeesOverTime(eventId: string) {
    const analytics = await this.getEventAnalytics(eventId);
    const attendeeByDay = analytics.attendeeByDay || {};

    // Convert to array of { date, count }
    const result = Object.keys(attendeeByDay).map((date) => ({
      date,
      count: attendeeByDay[date],
    }));

    return result;
  }
}
