import { redis } from '../config/redisconfig.js';

const EXPIRE_SECONDS = 5 * 60;

export async function setEmailConfirmed(userUuid) {
  await redis.set(`emailConfirmed:${userUuid}`, 'true', { ex: EXPIRE_SECONDS });
}

export async function isEmailConfirmed(userUuid) {
  const value = await redis.get(`emailConfirmed:${userUuid}`);
  return value === 'true';
}

export async function clearEmailConfirmed(userUuid) {
  await redis.del(`emailConfirmed:${userUuid}`);
}
