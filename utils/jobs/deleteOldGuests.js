import { logCronJobStart, logCronJobComplete, logCronJobError } from '../loggers/systemLoggers.js';
import prisma from '../prismaConfig/prismaClient.js';

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
