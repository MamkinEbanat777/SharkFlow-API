import { redis } from '../config/redisconfig.js';

const EXPIRE_SECONDS = 15 * 60; 
const MAX_ATTEMPTS = 5; 
const ATTEMPT_WINDOW_SECONDS = 5 * 60; 
const BLOCK_TIME_SECONDS = 10 * 60; 

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
];

function getAttemptKey(type, key) {
  return `confirmationAttempts:${type}:${key}`;
}

function getBlockKey(type, key) {
  return `confirmationBlocked:${type}:${key}`;
}

function getConfirmationKey(type, key) {
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error(`Unknown confirmation code type: ${type}`);
  }
  return `confirmation:${type}:${key}`;
}

export async function setConfirmationCode(type, key, code) {
  if (typeof code !== 'string') {
    throw new Error('Confirmation code must be a string');
  }
  await redis.set(getConfirmationKey(type, key), code, {
    ex: EXPIRE_SECONDS,
  });
}

export async function getConfirmationCode(type, key) {
  const value = await redis.get(getConfirmationKey(type, key));
  return value || null;
}

export async function deleteConfirmationCode(type, key) {
  await redis.del(getConfirmationKey(type, key));
}

export async function isConfirmationBlocked(type, key) {
  const blocked = await redis.exists(getBlockKey(type, key));
  return blocked === 1;
}

export async function registerFailedAttempt(type, key) {
  const attemptKey = getAttemptKey(type, key);
  const current = await redis.incr(attemptKey);
  if (current === 1) {
    await redis.expire(attemptKey, ATTEMPT_WINDOW_SECONDS);
  }

  if (current >= MAX_ATTEMPTS) {
    await redis.set(getBlockKey(type, key), '1', { ex: BLOCK_TIME_SECONDS });
  }
}

export async function resetConfirmationAttempts(type, key) {
  await redis.del(getAttemptKey(type, key));
  await redis.del(getBlockKey(type, key));
}
