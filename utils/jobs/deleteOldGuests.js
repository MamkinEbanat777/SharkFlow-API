/**
 * @module jobs/deleteOldGuests
 * @description Задачи для удаления старых гостевых аккаунтов.
 */
import { logCronJobStart, logCronJobComplete, logCronJobError } from '../loggers/systemLoggers.js';
import prisma from '../prismaConfig/prismaClient.js';

/**
 * Удаляет гостевые аккаунты старше 30 дней
 * @param {string} [ip='system'] - IP адрес для логирования
 * @returns {Promise<void>}
 */
export async function deleteOldGuests(ip = 'system') {
  try {
    logCronJobStart('deleteOldGuests', ip);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const deleted = await prisma.user.deleteMany({
      where: {
        role: 'guest',
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
    logCronJobComplete('deleteOldGuests', ip, `Удалено ${deleted.count} гостевых аккаунтов`);
  } catch (err) {
    logCronJobError('deleteOldGuests', err, ip);
  }
}
