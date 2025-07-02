import prisma from '../prismaConfig/prismaClient.js';
import { sanitizeLogin } from './sanitizeLogin.js';

export async function generateUniqueLogin(base) {
  let login = sanitizeLogin(base);
  let uniqueLogin = login;
  let suffix = Math.floor(1000 + Math.random() * 9000);

  while (await prisma.user.findUnique({ where: { login: uniqueLogin } })) {
    uniqueLogin = `${login}${suffix++}`;
  }

  return uniqueLogin;
}
