import prisma from '../../utils/prismaConfig/prismaClient.js';
import { logTelegramMiddlewareError } from '../../utils/loggers/middlewareLoggers.js';

export const authenticateTelegramMiddleware = async (ctx, next) => {
  const telegramId = BigInt(ctx.from?.id);

  if (!telegramId) {
    await ctx.reply('Не удалось определить ваш Telegram ID.');
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { telegramId, isDeleted: false },
      select: {
        uuid: true,
        email: true,
        login: true,
        telegramId: true,
        telegramEnabled: true,
        role: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      await ctx.reply(
        'Вы не авторизованы через Telegram. Перейдите на наш сайт для авторизации: https://sharkflow.onrender.com ',
      );
      return;
    }

    ctx.state.user = user;

    await next();
  } catch (error) {
    logTelegramMiddlewareError('verificationError', ctx.ip, error);
  }
};
