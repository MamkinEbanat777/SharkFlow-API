/**
 * @module cookie/login
 * @description Настройки cookie для логина.
 */
/**
 * Возвращает настройки для refresh-токен куки
 * @param {boolean} [rememberMe=false] - Запомнить пользователя
 * @returns {Object} Настройки куки для Express
 */
export function getRefreshCookieOptions(rememberMe = false) {
  const maxAge = rememberMe
    ? parseInt(
        process.env.COOKIE_MAX_AGE_REMEMBER || `${30 * 24 * 60 * 60 * 1000}`,
        10,
      )
    : parseInt(
        process.env.COOKIE_MAX_AGE_NO_REMEMBER || `${24 * 60 * 60 * 1000}`,
        10,
      );

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge,
    path: '/',
  };
}
