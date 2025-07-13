/**
 * @module helpers/avatar
 * @description Вспомогательные функции для работы с аватарами пользователей.
 */
import prisma from '../prismaConfig/prismaClient.js';
import { isValidUUID } from '../validators/taskValidators.js';

/**
 * Поиск пользователя для работы с аватаром
 * @param {string} userUuid - UUID пользователя
 * @param {Object} select - Объект для выбора полей (опционально)
 * @returns {Promise<Object|null>} Пользователь или null если не найден
 * @example
 * const user = await findUserForAvatar('123e4567-e89b-12d3-a456-426614174000');
 */
export const findUserForAvatar = async (userUuid, select = {}) => {
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }
  return await prisma.user.findFirst({
    where: { uuid: userUuid, isDeleted: false },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

/**
 * Валидация URL изображения
 * @param {string} imgUrl - URL изображения для проверки
 * @returns {Object} Результат валидации {isValid: boolean, error?: string}
 * @example
 * const validation = validateImageUrl('https://example.com/image.jpg');
 * if (!validation.isValid) {
 *   throw new Error(validation.error);
 * }
 */
export const validateImageUrl = (imgUrl) => {
  if (!imgUrl || typeof imgUrl !== 'string') {
    return { isValid: false, error: 'Невалидный URL изображения' };
  }

  try {
    new URL(imgUrl);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Невалидный URL изображения' };
  }
};

/**
 * Обновление аватара пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} imgUrl - URL нового аватара
 * @param {string|null} publicId - Public ID в Cloudinary (опционально)
 * @returns {Promise<Object>} Обновленный пользователь с avatarUrl
 * @example
 * const updatedUser = await updateUserAvatar(userUuid, 'https://example.com/avatar.jpg', 'cloudinary_id');
 */
export const updateUserAvatar = async (userUuid, imgUrl, publicId = null) => {
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }
  return await prisma.user.update({
    where: { uuid: userUuid },
    data: { avatarUrl: imgUrl, publicId },
    select: { avatarUrl: true },
  });
};

/**
 * Очистка аватара пользователя (установка в null)
 * @param {number} userId - ID пользователя
 * @returns {Promise<Object>} Обновленный пользователь
 * @example
 * const updatedUser = await clearUserAvatar(123);
 */
export const clearUserAvatar = async (userId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null, publicId: null },
  });
};
