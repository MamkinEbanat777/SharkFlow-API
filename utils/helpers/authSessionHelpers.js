import { createOrUpdateDeviceSession } from './deviceSessionHelper.js';
import { issueRefreshToken } from '#utils/tokens/refreshToken.js';
import { createAccessToken } from '#utils/tokens/accessToken.js';
import { createCsrfToken } from '#utils/tokens/csrfToken.js';
import { getRefreshCookieOptions } from '#utils/cookie/refreshCookie.js';
import { REFRESH_COOKIE_NAME } from '#config/cookiesConfig.js';

/**
 * Универсальный helper для создания/обновления deviceSession и токенов
 * @param {Object} params
 * @param {Object} params.user - объект пользователя
 * @param {string} params.deviceId
 * @param {string} params.userAgent
 * @param {string} params.ipAddress
 * @param {Object} params.req
 * @param {Object} params.res
 * @param {boolean} [params.rememberMe]
 * @param {string} [params.referrer]
 * @param {Object} [params.geoLocation]
 * @returns {Promise<{accessToken: string, csrfToken: string, deviceId: string}>}
 */
export async function createUserSessionAndTokens({ user, deviceId, userAgent, ipAddress, req, res, rememberMe = false, referrer = null, geoLocation = null }) {
  const deviceSession = await createOrUpdateDeviceSession({
    userId: user.id,
    deviceId,
    userAgent,
    ipAddress,
    referrer,
    geoLocation,
  });
  const refreshToken = await issueRefreshToken({
    userUuid: user.uuid,
    rememberMe,
    userId: user.id,
    deviceSessionId: deviceSession.id,
  });
  const accessToken = createAccessToken(user.uuid, user.role);
  const csrfToken = createCsrfToken(user.uuid);
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getRefreshCookieOptions(rememberMe),
  );
  return {
    accessToken,
    csrfToken,
    deviceId: deviceSession.deviceId,
  };
} 