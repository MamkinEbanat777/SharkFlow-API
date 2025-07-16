import prisma from '#utils/prismaConfig/prismaClient.js';
import { convertGuestToUser } from './guestConversionHelper.js';
import { generateUniqueLogin } from '#utils/generators/generateUniqueLogin.js';
import { getGuestCookieOptions } from '#utils/cookie/guestCookie.js';

/**
 * Универсальный helper для поиска/создания пользователя и создания OAuth-связи
 * @param {Object} params
 * @param {string} params.provider - Название провайдера ('google', 'github', 'yandex')
 * @param {string} params.providerId - ID/sub/id провайдера
 * @param {string} params.email - Email пользователя
 * @param {string} [params.guestUuid] - UUID гостя (если есть)
 * @param {string} [params.givenName] - Имя пользователя (если есть)
 * @param {Object} [params.req] - req для очистки куки гостя (если нужно)
 * @param {Object} [params.res] - res для очистки куки гостя (если нужно)
 * @returns {Promise<Object>} user
 */
export async function findOrCreateUserWithOAuth({ provider, providerId, email, guestUuid, givenName, req, res }) {
  return await prisma.$transaction(async (tx) => {
    let user = null;
    if (guestUuid) {
      const baseLogin = givenName || email.split('@')[0] || 'user';
      const login = await generateUniqueLogin(baseLogin);
      const convertedUser = await convertGuestToUser(guestUuid, {
        email,
        login,
        oauthData: null, // OAuth связь создаём ниже
      });
      if (convertedUser) {
        user = convertedUser;
        if (res && req) {
          res.clearCookie('guest_uuid', getGuestCookieOptions());
        }
      }
    }
    if (!user) {
      const baseLogin = givenName || email.split('@')[0] || 'user';
      const login = await generateUniqueLogin(baseLogin);
      user = await tx.user.create({
        data: {
          login,
          email: email,
          avatarUrl: null,
          password: null,
          role: 'user',
        },
      });
    }
    await tx.userOAuth.create({
      data: {
        userId: user.id,
        provider,
        providerId,
        email: email,
        enabled: true,
      },
    });
    return user;
  });
} 