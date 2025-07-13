import { redis } from '../config/redisconfig.js';
import { ALLOWED_TYPES } from '../config/allowedRedisTypes.js';

const EXPIRE_SECONDS = 15 * 60;

function getEmailConfirmedKey(type, userUuid) {
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error(`Unknown temp data type: ${type}`);
  }
  return `emailConfirmed:${type}:${userUuid}`;
}

export async function setEmailConfirmed(type, userUuid) {
  await redis.set(getEmailConfirmedKey(type, userUuid), 'true', {
    ex: EXPIRE_SECONDS,
  });
}

export async function isEmailConfirmed(type, userUuid) {
  const value = await redis.get(getEmailConfirmedKey(type, userUuid));
  return value === 'true';
}

export async function clearEmailConfirmed(type, userUuid) {
  await redis.del(getEmailConfirmedKey(type, userUuid));
}
