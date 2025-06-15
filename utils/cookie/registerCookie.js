export function getRegistrationCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: process.env.REGISTRATION_COOKIE_MAX_AGE || 15 * 60 * 1000,
    path: '/',
  };
}
