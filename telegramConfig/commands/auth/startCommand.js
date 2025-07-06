import prisma from '../../../utils/prismaConfig/prismaClient.js';
import {
  getUserTempData,
  deleteUserTempData,
} from '../../../store/userTempData.js';

export default function registerStartCommand(bot) {
  bot.start(async (ctx) => {
    const authUrl = 'https://sharkflow.onrender.com/';

    const messageText = ctx.message?.text || '';

    const args = messageText.split(' ');
    const nonce = args[1];
    
    const telegramId = BigInt(ctx.from?.id);

    const existingUser = await prisma.user.findFirst({
      where: { telegramId, isDeleted: false },
    });

    if (existingUser) {
      return await ctx.reply('Вы уже авторизованы.');
    }

    if (!nonce || typeof nonce !== 'string' || nonce.length > 100) {
      return await ctx.reply(
        `Неверный или отсутствующий код авторизации. Пожалуйста, перейдите на сайт для получения новой ссылки: ${authUrl}`,
      );
    }

    try {
      const data = await getUserTempData('telegramAuth', nonce);

      if (!data) {
        return await ctx.reply(
          `Срок действия кода истёк или он недействителен. Перейдите на сайт для повторной авторизации: ${authUrl}`,
        );
      }

      const userUuid = data?.userUuid;

      if (typeof userUuid !== 'string') {
        console.error(
          '[start] Ожидалась строка для userUuid, получено:',
          userUuid,
        );
        return await ctx.reply(
          'Ошибка привязки Telegram. Неверный формат идентификатора пользователя.',
        );
      }

      await deleteUserTempData('telegramAuth', nonce);

      const user = await prisma.user.findFirst({
        where: { uuid: userUuid, isDeleted: false },
        select: { telegramId: true },
      });

      if (!user) {
        return await ctx.reply(
          'Пользователь не найден. Возможно, срок действия ссылки истёк.',
        );
      }

      if (user.telegramId) {
        return await ctx.reply('Вы уже привязали Telegram к своему аккаунту.');
      }

      const existingUserWithTelegramId = await prisma.user.findFirst({
        where: {
          telegramId,
          isDeleted: false,
          uuid: { not: userUuid },
        },
      });

      if (existingUserWithTelegramId) {
        return await ctx.reply(
          'Этот Telegram уже привязан к другому аккаунту.',
        );
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: { telegramId },
      });

      return await ctx.reply('Telegram успешно привязан к вашему аккаунту!');
    } catch (e) {
      console.error('[start] Ошибка при привязке Telegram:', e);
      return await ctx.reply('Произошла внутренняя ошибка. Попробуйте позже.');
    }
  });
}
