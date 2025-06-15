import jwt from 'jsonwebtoken';
import { generateUUID } from '../generators/generateUUID.js';
export function createRefreshToken(userUuid, rememberMe = false) {
  const expiresIn = rememberMe
    ? process.env.JWT_REFRESH_EXPIRES_REMEMBER || '30d'
    : process.env.JWT_REFRESH_EXPIRES_NO_REMEMBER || '1d';

  const payload = {
    userUuid,
    jti: generateUUID(),
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });
}
