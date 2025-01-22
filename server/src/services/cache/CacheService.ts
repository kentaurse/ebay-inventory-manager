import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger } from '../../utils/logger';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      Logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      Logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      Logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  generateKey(...parts: string[]): string {
    return parts.join(':');
  }
} 