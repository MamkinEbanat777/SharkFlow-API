import jwt from 'jsonwebtoken';

export function createAccessToken(userUuid, role = 'user') {
  return jwt.sign({ userUuid, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    algorithm: 'HS256',
  });
}
