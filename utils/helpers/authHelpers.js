/**
 * @module helpers/auth
 * @description Вспомогательные функции для аутентификации и авторизации.
 */
import { createAccessToken } from '#utils/tokens/accessToken.js';
import { createCsrfToken } from '#utils/tokens/csrfToken.js';
import { issueRefreshToken } from '#utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '#utils/cookie/refreshCookie.js';
import { isValidUUID } from '#utils/validators/taskValidators.js';
import { REFRESH_COOKIE_NAME } from '#config/cookiesConfig.js';

import DeviceDetector from 'device-detector-js';

/**
 * Получение IP адреса клиента из запроса
 * @param {Object} req - Express request объект
 * @returns {string} IP адрес клиента или 'unknown'
 * @example
 * const ipAddress = getClientIP(req);
 */
export const getClientIP = (req) => {
  const ip = req.ip;
  return typeof ip === 'string' && ip !== '' ? ip : 'unknown';
};


/**
 * Создание всех токенов аутентификации для пользователя
 * @param {Object} user - Объект пользователя
 * @param {boolean} rememberMe - Флаг "запомнить меня"
 * @param {number} deviceSessionId - id сессии устройства
 * @returns {Promise<Object>} Объект с accessToken, csrfToken, refreshToken
 * @example
 * const tokens = await createAuthTokens(user, true, req);
 */
export const createAuthTokens = async (user, rememberMe, deviceSessionId) => {
  if (!isValidUUID(user.uuid)) {
    throw new Error('Invalid user UUID');
  }

  const accessToken = createAccessToken(user.uuid, user.role);
  const csrfToken = createCsrfToken(user.uuid, user.role);
  const refreshToken = await issueRefreshToken({
    userUuid: user.uuid,
    rememberMe,
    userId: user.id,
    deviceSessionId,
  });

  return { accessToken, csrfToken, refreshToken };
};

/**
 * Установка refresh token в cookie
 * @param {Object} res - Express response объект
 * @param {string} refreshToken - Refresh token для установки
 * @param {boolean} rememberMe - Флаг "запомнить меня" для настроек cookie
 * @example
 * setAuthCookies(res, 'refresh_token_here', true);
 */
export const setAuthCookies = (res, refreshToken, rememberMe) => {
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getRefreshCookieOptions(rememberMe),
  );
};

/**
 * Получение информации о запросе (IP и User-Agent)
 * @param {Object} req - Express request объект
 * @returns {Object} Объект с ipAddress и userAgent
 * @example
 * const requestInfo = getRequestInfo(req);
 */
export const getRequestInfo = (req) => {
  return {
    ipAddress: getClientIP(req),
    userAgent: req.get('user-agent') || null,
  };
};

const deviceDetector = new DeviceDetector();

export function parseDeviceInfo(userAgent) {
  const result = deviceDetector.parse(userAgent);

  return {
    clientType: result.client?.type,
    clientName: result.client?.name,
    clientVersion: result.client?.version,
    osName: result.os?.name,
    osVersion: result.os?.version,
    deviceType: result.device?.type,
    deviceBrand: result.device?.brand,
    deviceModel: result.device?.model,
    bot: result.bot?.name ?? null,
  };
}
