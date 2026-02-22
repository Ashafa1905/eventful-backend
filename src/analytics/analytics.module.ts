import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager'; // <-- Import from cache-manager
import * as redisStore from 'cache-manager-ioredis';
import { MongooseModule } from '@nestjs/mongoose';
import { Analytics, AnalyticsSchema } from './schemas/analytics.schema';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Analytics.name, schema: AnalyticsSchema }]),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST ?? 'localhost', // Provide fallback
      port: parseInt(process.env.REDIS_PORT ?? '6379'), // fallback to 6379
      ttl: 300, // 5 minutes
    }),
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
