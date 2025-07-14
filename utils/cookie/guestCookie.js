/**
 * Возвращает настройки для гостевой куки
 * @returns {Object} Настройки куки для Express
 */
export function getGuestCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: process.env.GUEST_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000, // 1 день
    path: '/',
  };
}
