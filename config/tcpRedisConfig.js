import { createClient } from 'redis';
import { RedisStore } from 'connect-redis'; 

export const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_REST_TCP,
  socket: { tls: true, rejectUnauthorized: false },
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

export async function connectToRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis connected');
  }
}

export function getRedisStore() {
  return new RedisStore({
    client: redisClient,
    prefix: 'sess:',
  });
}
