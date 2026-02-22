// src/app.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';

// Load .env variables at startup
dotenv.config();

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Simple Redis test
   * Stores a value in cache for 10 seconds and retrieves it
   */
    async testCache(): Promise<string | null> {
      try {
        await this.cacheManager.set('ping', 'pong', 10); // TTL in seconds
        const value = await this.cacheManager.get<string>('ping');
        this.logger.log(`Redis test value: ${value ?? 'null'}`);
        return value ?? null; // ← ensure the return type matches string | null
      } catch (error) {
        this.logger.error('Redis test failed', error);
        return null;
      }
    }

}
