// src/analytics/dtos/analytics-query.dto.ts
export class AnalyticsQueryDto {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}
