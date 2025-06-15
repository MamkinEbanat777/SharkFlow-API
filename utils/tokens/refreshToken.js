import jwt from 'jsonwebtoken';

export function createRefreshToken(userUuid, rememberMe = false) {
  const expiresIn = rememberMe
    ? process.env.JWT_REFRESH_EXPIRES_REMEMBER || '30d'
    : process.env.JWT_REFRESH_EXPIRES_NO_REMEMBER || '1d';

  return jwt.sign({ userUuid }, process.env.JWT_REFRESH_SECRET, { expiresIn });
}
