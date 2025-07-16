import { RedisStore as ConnectRedisStore } from 'connect-redis';
import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_REST_TCP,
  socket: { tls: true, rejectUnauthorized: false },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis connected');
  }
}

export const RedisStore = new ConnectRedisStore({
  client: redisClient,
  prefix: 'sess:',
});
