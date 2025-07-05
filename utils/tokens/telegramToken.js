import jwt from 'jsonwebtoken';

export function telegramToken(userUuid) {
  return jwt.sign(
    { userUuid }, 
    process.env.JWT_TELEGRAM_SECRET,
    {
      expiresIn: process.env.JWT_TELEGRAM_EXPIRES || '1h',
      algorithm: 'HS256',
    },
  );
}
