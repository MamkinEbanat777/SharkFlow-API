/**
 * @module telegramBot/commands/auth/start
 * @description Команда /start для аутентификации в Telegram боте.
 */
import { Markup } from 'telegraf';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { logTelegramCommandError } from '#utils/loggers/telegramLoggers.js';
import { getUserTempData, deleteUserTempData } from '#store/userTempData.js';
import send from '#telegramBot/send.js';

export default function registerStartCommand(bot) {
  bot.start(async (ctx) => {
    const authUrl = 'https://sharkflow.onrender.com/';

    const messageText = ctx.message?.text || '';

    const args = messageText.split(' ');
    const nonce = args[1];

    const telegramId = ctx.from?.id?.toString();

    if (!telegramId) {
      return await send(ctx, 'Ошибка: не удалось определить Telegram ID');
    }

    const existingOAuth = await prisma.userOAuth.findFirst({
      where: {
        provider: 'telegram',
        providerId: telegramId,
        user: {
          isDeleted: false,
        },
      },
    });

    if (existingOAuth) {
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
        logTelegramCommandError(
          'start',
          userUuid,
          new Error('Ожидалась строка для userUuid'),
        );
        return await send(
          ctx,
          'Ошибка привязки Telegram. Неверный формат идентификатора пользователя.',
        );
      }

      await deleteUserTempData('telegramAuth', nonce);

      const user = await prisma.user.findFirst({
        where: { uuid: userUuid, isDeleted: false },
        select: { id: true },
      });

      if (!user) {
        logTelegramCommandError(
          'start',
          userUuid,
          new Error('Пользователь не найден'),
        );
        await ctx.reply('❌ Пользователь не найден в системе');
        return;
      }

      const userOAuthExists = await prisma.userOAuth.findFirst({
        where: {
          userId: user.id,
          provider: 'telegram',
        },
      });

      if (userOAuthExists) {
        return await send(ctx, 'Вы уже привязали Telegram к своему аккаунту.');
      }

      const conflictOAuth = await prisma.userOAuth.findFirst({
        where: {
          provider: 'telegram',
          providerId: telegramId,
          userId: { not: user.id },
        },
      });

      if (conflictOAuth) {
        return await send(
          ctx,
          'Этот Telegram уже привязан к другому аккаунту.',
        );
      }

      await prisma.userOAuth.create({
        data: {
          userId: user.id,
          provider: 'telegram',
          providerId: telegramId,
          enabled: true,
        },
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
