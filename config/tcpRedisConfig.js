import { createClient } from 'redis';

let RedisStore;

(async () => {
  const mod = await import('connect-redis');
  RedisStore = mod.default || mod;
})();

export const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_REST_TCP,
  socket: { tls: true, rejectUnauthorized: false },
});
redisClient.on('error', console.error);

export async function connectToRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('✅ Redis connected');
  }
}

export function getRedisStore() {
  if (!RedisStore) {
    throw new Error('RedisStore not initialized yet');
  }
  return new RedisStore({
    client: redisClient,
    prefix: 'sess:',
  });
}
