import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { MongooseModule } from '@nestjs/mongoose';
import { Analytics, AnalyticsSchema } from './schemas/analytics.schema';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

console.log(`Redit has a port ${process.env.REDIS_PORT}`)
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Analytics.name, schema: AnalyticsSchema }]),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,        // Redis host
      port: parseInt(process.env.REDIS_PORT),   // Redis port
      auth_pass: process.env.REDIS_PASSWORD,             // Add password for cloud Redis
      ttl: 300, // 5 minutes
    }),
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}