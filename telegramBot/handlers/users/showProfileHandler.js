/**
 * @module telegramBot/handlers/users/showProfile
 * @description Обработчик показа профиля пользователя в Telegram боте.
 */
import { Markup } from 'telegraf';
import send from '#telegramBot/send.js';

export async function showProfileHandler(ctx) {
  const user = ctx.state.user;

  const message = `
    🔐 <b>Ваш профиль</b>

    👤 <b>Логин:</b> ${user?.login}
    📧 <b>Email:</b> ${user?.email}
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('🗂 Мои доски', 'show_boards'),
      Markup.button.callback('🚪 Выйти из аккаунта', 'logout')
    ],
    [
      Markup.button.callback('🔙 Назад в меню', 'back_to_main')
    ]
  ]);

  await send(ctx, message, keyboard);
}
