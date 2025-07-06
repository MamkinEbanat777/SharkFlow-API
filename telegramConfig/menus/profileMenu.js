import menuPkg from 'telegraf-inline-menu';
import { Markup } from 'telegraf';
import { showProfileHandler } from '../handlers/users/showProfileHandler.js';
import { logoutHandler } from '../handlers/users/logoutHandler.js';
import withAuth from '../withAuth.js';

const { MenuTemplate, MenuMiddleware } = menuPkg;

const profileTemplate = new MenuTemplate(() => 'Вы в профиле');

profileTemplate.interact('🔐 Информация о профиле', 'me', {
  do: withAuth(showProfileHandler),
});

profileTemplate.interact('🔓 Отвязать Telegram', 'confirm_unlink_prompt', {
  do: withAuth(async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      'Вы действительно хотите отвязать Telegram?',
      Markup.inlineKeyboard([
        Markup.button.callback('✅ Да', 'logout_confirmed'),
        Markup.button.callback('❌ Нет', 'cancel_unlink'),
      ]),
    );
  }),
});

profileTemplate.interact('✅ Да', 'logout_confirmed', {
  do: withAuth(logoutHandler),
});

profileTemplate.interact('❌ Нет', 'cancel_unlink', {
  do: withAuth(async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.menu.reenterMenu();
  }),
});

export default function registerProfileMenu(bot) {
  const middleware = new MenuMiddleware('profile/', profileTemplate);
  bot.use(middleware.middleware());
}
