import { redis } from '../config/redisconfig.js';

const EXPIRE_SECONDS = 15 * 60;

export async function setConfirmationCode(key, data) {
  await redis.set(`confirmation:${key}`, JSON.stringify(data), {
    ex: EXPIRE_SECONDS,
  });
  console.log('[setConfirmationCode]', key, data);
}

export async function getConfirmationCode(key) {
  const value = await redis.get(`confirmation:${key}`);
  if (!value) return null;

  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (e) {
    console.error(
      `[getConfirmationCode] Ошибка парсинга для ключа confirmation:${key}`,
      e,
    );
    return null;
  }
}

export async function deleteConfirmationCode(key) {
  await redis.del(`confirmation:${key}`);
  console.log('[deleteConfirmationCode]', key);
}
