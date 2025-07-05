import jwt from 'jsonwebtoken';

export function createCsrfToken(userUuid, role = 'user') {
  return jwt.sign({ userUuid, role }, process.env.JWT_CSRF_SECRET, {
    expiresIn: process.env.JWT_CSRF_EXPIRES || '15m',
    algorithm: 'HS256',
  });
}
