import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overall')
  async getOverall() {
    return this.analyticsService.getOverallAnalytics();
  }

  @Get('events/:eventId')
  async getEvent(@Param('eventId') eventId: string) {
    return this.analyticsService.getEventAnalytics(eventId);
  }

  @Get('events/:eventId/revenue-over-time')
  async revenueOverTime(
    @Param('eventId') eventId: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.analyticsService.getRevenueOverTime(eventId, groupBy);
  }

  @Get('events/:eventId/tickets-by-channel')
  async ticketsByChannel(@Param('eventId') eventId: string) {
    return this.analyticsService.getTicketsSoldByChannel(eventId);
  }

  @Get('events/:eventId/attendees-over-time')
  async attendeesOverTime(@Param('eventId') eventId: string) {
    return this.analyticsService.getAttendeesOverTime(eventId);
  }
}
