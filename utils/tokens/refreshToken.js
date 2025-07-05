import jwt from 'jsonwebtoken';
import { generateUUID } from '../generators/generateUUID.js';
import { getRefreshCookieOptions } from '../cookie/loginCookie.js';
import prisma from '../prismaConfig/prismaClient.js';

export function createRefreshToken(userUuid, rememberMe = false) {
  const expiresIn = rememberMe
    ? process.env.JWT_REFRESH_EXPIRES_REMEMBER || '30d'
    : process.env.JWT_REFRESH_EXPIRES_NO_REMEMBER || '1d';

  const payload = {
    userUuid,
    jti: generateUUID(),
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn,
    algorithm: 'HS256',
  });
}

export async function issueRefreshToken({
  res,
  userUuid,
  rememberMe = false,
  setCookie = true,
  ipAddress = null,
  userAgent = null,
  referrer = null,
  userId = null, 
}) {
  const refreshToken = createRefreshToken(userUuid, rememberMe);

  const expiresMs = rememberMe
    ? Number(process.env.SESSION_EXPIRES_REMEMBER_ME)
    : Number(process.env.SESSION_EXPIRES_DEFAULT);
  const expiresAt = new Date(Date.now() + expiresMs);

  let user;
  
  if (userId) {
    user = { id: userId };
  } else {
    user = await prisma.user.findFirst({
      where: { uuid: userUuid, isDeleted: false },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }
  }

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
      revoked: false,
      rememberMe,
      ipAddress,
      userAgent,
      referrer,
    },
  });

  if (setCookie && res && !res.headersSent) {
    res.cookie(
      'log___tf_12f_t2',
      refreshToken,
      getRefreshCookieOptions(rememberMe),
    );
  }

  return refreshToken;
}
