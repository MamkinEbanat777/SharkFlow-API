/**
 * @module rateLimiters/auth
 * @description Rate limiter'ы для аутентификации.
 */

import { normalizeEmail } from '../validators/normalizeEmail';

const loginAttempts = new Map();

const LOGIN_RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  blockDuration: 5 * 60 * 1000, // 5 минут
};

function getLoginKey(ip, email) {
  if (!email) return;
  return `${ip}-${normalizeEmail(email)}`;
}

/**
 * Проверяет, заблокирован ли IP-адрес для попыток входа
 * @param {string} ipAddress - IP адрес
 * @param {string} email - Email пользователя
 * @returns {Object} Результат проверки
 */
export const checkLoginRateLimit = (ipAddress, email) => {
  const key = getLoginKey(ipAddress, email);
  const attempts = loginAttempts.get(key);

  if (attempts) {
    const now = Date.now();

    if (attempts.blockedUntil && now > attempts.blockedUntil) {
      loginAttempts.delete(key);
      return { blocked: false };
    }

    if (attempts.count >= LOGIN_RATE_LIMIT_CONFIG.maxAttempts) {
      const timeLeftMs = attempts.blockedUntil - now;

      if (timeLeftMs > 0) {
        return {
          blocked: true,
          timeLeftMs,
          retryAfterSec: Math.ceil(timeLeftMs / 1000),
        };
      }
    }
  }

  return { blocked: false };
};

/**
 * Увеличивает счетчик попыток входа для IP-адреса и email
 * @param {string} ipAddress - IP адрес
 * @param {string} email - Email пользователя
 */
export const incrementLoginAttempts = (ipAddress, email) => {
  const key = getLoginKey(ipAddress, email);
  const now = Date.now();
  const attempts = loginAttempts.get(key) || { count: 0, blockedUntil: 0 };

  attempts.count++;

  if (attempts.count >= LOGIN_RATE_LIMIT_CONFIG.maxAttempts) {
    attempts.blockedUntil = now + LOGIN_RATE_LIMIT_CONFIG.blockDuration;
    console.warn(
      `[RateLimiter] IP ${ipAddress} заблокирован на ${
        LOGIN_RATE_LIMIT_CONFIG.blockDuration / 60000
      } мин. для email ${normalizeEmail(email)}`,
    );
  }

  loginAttempts.set(key, attempts);
};

/**
 * Сбрасывает счетчик попыток входа для IP-адреса и email
 * @param {string} ipAddress - IP адрес
 * @param {string} email - Email пользователя
 */

export const resetLoginAttempts = (ipAddress, email) => {
  const key = getLoginKey(ipAddress, email);
  loginAttempts.delete(key);
};
