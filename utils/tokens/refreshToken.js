/**
 * @module tokens/refresh
 * @description Функции для работы с refresh-токенами.
 */
import jwt from 'jsonwebtoken';
import { generateUUID } from '../generators/generateUUID.js';
import { getRefreshCookieOptions } from '../cookie/refreshCookie.js';
import prisma from '../prismaConfig/prismaClient.js';
import { REFRESH_COOKIE_NAME } from '../../config/cookiesConfig.js';

/**
 * Создает JWT refresh-токен
 * @param {string} userUuid - UUID пользователя
 * @param {boolean} [rememberMe=false] - Запомнить пользователя
 * @returns {string} JWT refresh-токен
 */
function createRefreshToken(userUuid, rememberMe = false) {
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

/**
 * Выдает refresh-токен и сохраняет его в базе данных
 * @param {Object} params - Параметры
 * @param {Object} [params.res] - Express response объект
 * @param {string} params.userUuid - UUID пользователя
 * @param {boolean} [params.rememberMe=false] - Запомнить пользователя
 * @param {boolean} [params.setCookie=true] - Установить куки
 * @param {number} [params.userId=null] - ID пользователя (если известен)
 * @param {number} [params.deviceSessionId=null] - ID сессии устройства
 * @returns {Promise<string>} Refresh-токен
 * @throws {Error} Если пользователь не найден
 */
export async function issueRefreshToken({
  res,
  userUuid,
  rememberMe = false,
  setCookie = true,
  userId = null,
  deviceSessionId = null,
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
      deviceSessionId,
    },
  });

  if (setCookie && res && !res.headersSent) {
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      getRefreshCookieOptions(rememberMe),
    );
  }

  return refreshToken;
}
