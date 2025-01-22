import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';

export const redisConfig = CacheModule.registerAsync({
  useFactory: () => ({
    store: redisStore,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    ttl: 60 * 60, // 1時間のデフォルトTTL
    max: 1000 // キャッシュの最大エントリ数
  } as RedisClientOptions)
}); 