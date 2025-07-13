import prisma from '../prismaConfig/prismaClient.js';
import { transliterate } from 'transliteration';

/**
 * Очищает и транслитерирует базовую строку в валидный логин
 * @param {string} base - Базовая строка для логина
 * @returns {string} Очищенный логин
 */
function sanitizeLogin(base) {
  const cleaned = transliterate(base)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30);

  return cleaned || 'user';
}

/**
 * Генерирует уникальный логин на основе базовой строки
 * @param {string} base - Базовая строка для логина
 * @returns {Promise<string>} Уникальный логин
 * @throws {Error} Если не удалось сгенерировать уникальный логин
 */
export async function generateUniqueLogin(base) {
  let login = sanitizeLogin(base);
  let uniqueLogin = login;
  let suffix = 1000;

  while (
    await prisma.user.findFirst({
      where: { login: uniqueLogin, isDeleted: false },
      select: { id: true },
    })
  ) {
    uniqueLogin = `${login}${suffix++}`;
    if (suffix > 9999) {
      throw new Error('Не удалось сгенерировать уникальный логин');
    }
  }

  return uniqueLogin;
}
