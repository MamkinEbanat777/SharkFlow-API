import { authenticateTelegramMiddleware } from '../../middlewares/http/authenticateTelegramMiddleware.js';
import prisma from '../../utils/prismaConfig/prismaClient.js';

export default function registerLogoutCommand(bot) {
  bot.command('logout', authenticateTelegramMiddleware, async (ctx) => {
    try {
      const user = ctx.state.user;

      await prisma.user.update({
        where: { uuid: user.uuid },
        data: { telegramId: null, telegramEnabled: false },
      });

      return ctx.reply('Вы успешно вышли из аккаунта в Telegram!');
    } catch (e) {
      console.error('[logout] Ошибка при выходе:', e);
      return ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  });
}
