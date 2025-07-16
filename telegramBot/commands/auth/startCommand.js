/**
 * @module telegramBot/commands/auth/start
 * @description Команда /start для аутентификации в Telegram боте.
 */
import { Markup } from 'telegraf';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { logTelegramCommandError } from '#utils/loggers/telegramLoggers.js';
import {
  getUserTempData,
  deleteUserTempData,
} from '#store/userTempData.js';
import send from '#telegramBot/send.js';

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
      return await send(ctx, 'Вы уже авторизованы.');
    }

    if (!nonce || typeof nonce !== 'string' || nonce.length > 100) {
      return await send(
        ctx,
        `Неверный или отсутствующий код авторизации. Пожалуйста, перейдите на сайт для получения новой ссылки: ${authUrl}`,
      );
    }

    let userUuid;

    try {
      const data = await getUserTempData('telegramAuth', nonce);

      if (!data) {
        return await send(
          ctx,
          `Срок действия кода истёк или он недействителен. Перейдите на сайт для повторной авторизации: ${authUrl}`,
        );
      }

      userUuid = data?.userUuid;

      if (typeof userUuid !== 'string') {
        logTelegramCommandError('start', userUuid, new Error('Ожидалась строка для userUuid'));
        return await send(
          ctx,
          'Ошибка привязки Telegram. Неверный формат идентификатора пользователя.',
        );
      }

      await deleteUserTempData('telegramAuth', nonce);

      const user = await prisma.user.findFirst({
        where: { uuid: userUuid, isDeleted: false },
        select: { telegramId: true },
      });

      if (!user) {
        logTelegramCommandError('start', userUuid, new Error('Пользователь не найден'));
        await ctx.reply('❌ Пользователь не найден в системе');
        return;
      }

      if (user.telegramId) {
        return await send(ctx, 'Вы уже привязали Telegram к своему аккаунту.');
      }

      const existingUserWithTelegramId = await prisma.user.findFirst({
        where: {
          telegramId,
          isDeleted: false,
          uuid: { not: userUuid },
        },
      });

      if (existingUserWithTelegramId) {
        return await send(
          ctx,
          'Этот Telegram уже привязан к другому аккаунту.',
        );
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: { telegramId, telegramEnabled: true },
      });

      const message = `
        ✅ <b>Telegram успешно привязан к вашему аккаунту!</b>
        
        Теперь вы можете использовать бота для управления досками и задачами!.
      `.trim();

      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('🎯 Открыть меню', 'back_to_main'),
      ]);

      return await send(ctx, message, keyboard);
    } catch (error) {
      logTelegramCommandError('start', userUuid, error);
      await ctx.reply('❌ Произошла ошибка при привязке Telegram');
    }
  });
}
