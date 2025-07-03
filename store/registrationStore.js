import { redis } from '../config/redisconfig.js';

const EXPIRE_SECONDS = 15 * 60;

export async function setRegistrationData(uuid, data) {
  console.log('setRegistrationData data:', data);
  await redis.set(`registration:${uuid}`, JSON.stringify(data), {
    ex: EXPIRE_SECONDS,
  });
}

export async function getRegistrationData(uuid) {
  const value = await redis.get(`registration:${uuid}`);
  console.log('getRegistrationData raw value:', value);
  if (!value) return null;
  return typeof value === 'string' ? JSON.parse(value) : value;
}

export async function deleteRegistrationData(uuid) {
  await redis.del(`registration:${uuid}`);
}
