import { Markup } from 'telegraf';
import send from '../../send.js';

export async function showProfileHandler(ctx) {
  const user = ctx.state.user;

  const message = `
    🔐 <b>Вы авторизованы!</b>

    👤 <b>Логин:</b> ${user?.login}
    📧 <b>Email:</b> ${user?.email}
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    Markup.button.callback('🚪 Назад', 'back_to_main'),
  ]);

  await send(ctx, message, keyboard);
}
