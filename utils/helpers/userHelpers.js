/**
 * @module helpers/user
 * @description Вспомогательные функции для работы с пользователями.
 */
import prisma from '../prismaConfig/prismaClient.js';
import { isValidUUID } from '../validators/taskValidators.js';

/**
 * Поиск пользователя по UUID (только активные, не удаленные)
 * @param {string} uuid - UUID пользователя
 * @param {Object} select - Объект для выбора полей (опционально)
 * @returns {Promise<Object|null>} Пользователь или null если не найден
 * @example
 * const user = await findUserByUuid('123e4567-e89b-12d3-a456-426614174000');
 * const userWithEmail = await findUserByUuid('123e4567-e89b-12d3-a456-426614174000', { email: true, login: true });
 */
export const findUserByUuid = async (uuid, select = {}) => {
  if (!isValidUUID(uuid)) {
    throw new Error('Invalid user UUID');
  }
  return await prisma.user.findFirst({
    where: { uuid, isDeleted: false },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

/**
 * Поиск пользователя по email (только активные, не удаленные)
 * @param {string} email - Email пользователя
 * @param {Object} select - Объект для выбора полей (опционально)
 * @returns {Promise<Object|null>} Пользователь или null если не найден
 * @example
 * const user = await findUserByEmail('user@example.com');
 * const userWithRole = await findUserByEmail('user@example.com', { role: true, isActive: true });
 */
export const findUserByEmail = async (email, select = {}) => {
  return await prisma.user.findFirst({
    where: { email, isDeleted: false },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

/**
 * Поиск пользователя по Google Sub ID (только активные, не удаленные)
 * @param {string} googleSub - Google Sub ID пользователя
 * @param {Object} select - Объект для выбора полей (опционально)
 * @returns {Promise<Object|null>} Пользователь или null если не найден
 * @example
 * const user = await findUserByGoogleSub('google_sub_123');
 * const userWithGoogle = await findUserByGoogleSub('google_sub_123', { googleEmail: true, googleOAuthEnabled: true });
 */
export const findUserByGoogleSub = async (googleSub, select = {}) => {
  return await prisma.user.findFirst({
    where: { googleSub, isDeleted: false },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

/**
 * Проверка существования пользователя с выбросом ошибки
 * @param {Object|null} user - Объект пользователя
 * @param {string} errorMessage - Кастомное сообщение об ошибке
 * @returns {Object} Пользователь если существует
 * @throws {Error} Если пользователь не найден
 * @example
 * const user = requireUserExists(foundUser);
 * const user = requireUserExists(foundUser, 'Пользователь не найден в системе');
 */
export const requireUserExists = (
  user,
  errorMessage = 'Пользователь не найден',
) => {
  if (!user) {
    throw new Error(errorMessage);
  }
  return user;
};

/**
 * Проверка активности пользователя
 * @param {Object} user - Объект пользователя
 * @returns {Object} Пользователь если активен
 * @throws {Error} Если пользователь заблокирован
 * @example
 * const activeUser = requireUserActive(user);
 */
export const requireUserActive = (user) => {
  if (!user.isActive) {
    throw new Error('Аккаунт заблокирован. Обратитесь в поддержку.');
  }
  return user;
};

/**
 * Проверка что пользователь не удален
 * @param {Object} user - Объект пользователя
 * @returns {Object} Пользователь если не удален
 * @throws {Error} Если пользователь удален
 * @example
 * const notDeletedUser = requireUserNotDeleted(user);
 */
export const requireUserNotDeleted = (user) => {
  if (user.isDeleted) {
    throw new Error('Пользователь удален');
  }
  return user;
};

/**
 * Поиск пользователя по UUID с автоматической проверкой существования
 * @param {string} uuid - UUID пользователя
 * @param {Object} select - Объект для выбора полей (опционально)
 * @returns {Promise<Object>} Пользователь
 * @throws {Error} Если пользователь не найден
 * @example
 * const user = await findUserByUuidOrThrow('123e4567-e89b-12d3-a456-426614174000');
 * const userWithEmail = await findUserByUuidOrThrow('123e4567-e89b-12d3-a456-426614174000', { email: true });
 */
export const findUserByUuidOrThrow = async (uuid, select = {}) => {
  if (!isValidUUID(uuid)) {
    throw new Error('Invalid user UUID');
  }
  const user = await findUserByUuid(uuid, select);
  return requireUserExists(user);
};

/**
 * Поиск пользователя по email с автоматической проверкой существования
 * @param {string} email - Email пользователя
 * @param {Object} select - Объект для выбора полей (опционально)
 * @returns {Promise<Object>} Пользователь
 * @throws {Error} Если пользователь не найден
 * @example
 * const user = await findUserByEmailOrThrow('user@example.com');
 * const userWithRole = await findUserByEmailOrThrow('user@example.com', { role: true });
 */
export const findUserByEmailOrThrow = async (email, select = {}) => {
  const user = await findUserByEmail(email, select);
  return requireUserExists(user);
};
