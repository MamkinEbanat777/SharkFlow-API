import { redis } from '../config/redisconfig.js';

const EXPIRE_SECONDS = 15 * 60;

const ALLOWED_TYPES = [
  'registration',
  'passwordReset',
  'deleteUser',
  'updateUser',
  'setupTotp',
  'disableTotp',
  'emailChange',
  'disableGoogle',
  'connectGoogle',
  'checkCode',
  'twoFactorAuth',
  'telegramAuth',
];

function getUserTempKey(type, uuid) {
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error(`Unknown temp data type: ${type}`);
  }
  return `userTemp:${type}:${uuid}`;
}

export async function setUserTempData(type, uuid, data) {
  console.log('[setUserTempData]', type, uuid, data);
  await redis.set(getUserTempKey(type, uuid), JSON.stringify(data), {
    ex: EXPIRE_SECONDS,
  });
}

export async function getUserTempData(type, uuid) {
  const value = await redis.get(getUserTempKey(type, uuid));
  console.log('[getUserTempData]', type, uuid, value);
  if (!value) return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (e) {
    console.error(
      `[getUserTempData] JSON parse error for key userTemp:${type}:${uuid}`,
      e,
    );
    return null;
  }
}

export async function deleteUserTempData(type, uuid) {
  await redis.del(getUserTempKey(type, uuid));
}
