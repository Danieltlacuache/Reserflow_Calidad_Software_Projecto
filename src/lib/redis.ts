// src/lib/redis.ts
import Redis from 'ioredis';
import { validateEnv } from './env';

const env = validateEnv();

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    return Math.min(times * 50, 2000);
  },
  enableReadyCheck: true,
  lazyConnect: true,
});
