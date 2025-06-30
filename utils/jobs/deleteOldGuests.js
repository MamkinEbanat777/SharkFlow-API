import prisma from '../prismaConfig/prismaClient.js';

export async function deleteOldGuests() {
  const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24); // 24 часа назад

  try {
    const deleted = await prisma.user.deleteMany({
      where: {
        role: 'guest',
        createdAt: {
          lt: oneDayAgo,
        },
      },
    });

    if (deleted.count > 0) {
      console.log(`[cron] Удалено ${deleted.count} гостевых аккаунтов`);
    }
  } catch (err) {
    console.error('[cron] Ошибка при удалении гостей:', err);
  }
}
