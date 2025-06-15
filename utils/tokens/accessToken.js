import jwt from 'jsonwebtoken';

export function createAccessToken(userUuid) {
  return jwt.sign({ userUuid }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
}
