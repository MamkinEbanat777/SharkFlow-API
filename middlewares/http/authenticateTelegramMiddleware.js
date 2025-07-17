import prisma from '#utils/prismaConfig/prismaClient.js';
import { logTelegramMiddlewareError } from '#utils/loggers/middlewareLoggers.js';

export const authenticateTelegramMiddleware = async (ctx, next) => {
  const telegramId = ctx.from?.id?.toString();

  if (!telegramId) {
    await ctx.reply('Не удалось определить ваш Telegram ID.');
    return;
  }

  try {
    const userOAuth = await prisma.userOAuth.findFirst({
      where: {
        provider: 'telegram',
        providerId: telegramId,
        enabled: true,
        user: {
          isDeleted: false,
        },
      },
      include: {
        user: true,
      },
    });

    if (!userOAuth) {
      await ctx.reply(
        'Вы не авторизованы через Telegram. Перейдите на наш сайт для авторизации: https://sharkflow.onrender.com ',
      );
      return;
    }

    ctx.state.user = userOAuth.user;

    await next();
  } catch (error) {
    logTelegramMiddlewareError('verificationError', ctx.ip, error);
  }
};
