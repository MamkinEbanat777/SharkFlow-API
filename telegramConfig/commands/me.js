import { authenticateTelegramMiddleware } from '../../middlewares/http/authenticateTelegramMiddleware.js';

export default function registerMeCommand(bot) {
  bot.command('me', authenticateTelegramMiddleware, async (ctx) => {
    const user = ctx.state.user;

    return await ctx.reply(
      `Вы авторизованы! Ваш логин: ${user?.login} Ваша почта: ${user?.email}`,
    );
  });
}
