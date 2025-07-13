import prisma from '../prismaConfig/prismaClient.js';

/**
 * Конвертирует гостевой аккаунт в полноценного пользователя
 * @param {string} guestUuid - UUID гостевого аккаунта
 * @param {Object} userData - Данные для обновления пользователя
 * @param {string} userData.email - Email пользователя
 * @param {string} userData.login - Логин пользователя
 * @param {string} [userData.password] - Хешированный пароль (опционально)
 * @param {Object} [userData.oauthData] - Данные OAuth (опционально)
 * @returns {Promise<Object|null>} Обновленный пользователь или null
 * @example
 * const user = await convertGuestToUser(guestUuid, {
 *   email: 'user@example.com',
 *   login: 'username',
 *   oauthData: { googleSub: '123', googleOAuthEnabled: true }
 * });
 */
export const convertGuestToUser = async (guestUuid, userData) => {
  if (!guestUuid) return null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingGuest = await tx.user.findFirst({
        where: { uuid: guestUuid, isDeleted: false, role: 'guest' },
      });

      if (!existingGuest || existingGuest.role !== 'guest') {
        return null;
      }

      const updateData = {
        email: userData.email,
        login: userData.login,
        role: 'user',
      };

      if (userData.password) {
        updateData.password = userData.password;
      }

      if (userData.oauthData) {
        Object.assign(updateData, userData.oauthData);
      }

      const updatedUser = await tx.user.update({
        where: { uuid: guestUuid },
        data: updateData,
      });

      return updatedUser;
    });

    return result;
  } catch (error) {
    console.error('Ошибка при конвертации гостевого аккаунта:', error);
    return null;
  }
};

/**
 * Проверяет, является ли пользователь гостевым и может ли быть конвертирован
 * @param {string} guestUuid - UUID гостевого аккаунта
 * @returns {Promise<boolean>} true если пользователь может быть конвертирован
 * @example
 * const canConvert = await canConvertGuest(guestUuid);
 */
export const canConvertGuest = async (guestUuid) => {
  if (!guestUuid) return false;

  const existingGuest = await prisma.user.findFirst({
    where: { uuid: guestUuid, isDeleted: false, role: 'guest' },
  });

  return existingGuest && existingGuest.role === 'guest';
}; 