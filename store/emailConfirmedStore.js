import { redis } from '../config/redisconfig.js';
import { allowedTypes } from '../config/allowedTypes.js';

const EXPIRE_SECONDS = 15 * 60;

function getEmailConfirmedKey(type, userUuid) {
  if (!allowedTypes.includes(type)) {
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
