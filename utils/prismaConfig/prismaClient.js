import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
const prisma = new PrismaClient({});

/**
 * Экземпляр Prisma клиента для работы с базой данных
 * @type {PrismaClient}
 */
export default prisma;
