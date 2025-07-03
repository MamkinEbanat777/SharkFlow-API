import prisma from '../prismaConfig/prismaClient.js';
import { transliterate } from 'transliteration';

function sanitizeLogin(base) {
  const cleaned = transliterate(base)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30);

  return cleaned || 'user';
}

export async function generateUniqueLogin(base) {
  let login = sanitizeLogin(base);
  let uniqueLogin = login;
  let suffix = 1000;

  while (
    await prisma.user.findFirst({
      where: { login: uniqueLogin, isDeleted: false },
    })
  ) {
    uniqueLogin = `${login}${suffix++}`;
    if (suffix > 9999) {
      throw new Error('Не удалось сгенерировать уникальный логин');
    }
  }

  return uniqueLogin;
}
