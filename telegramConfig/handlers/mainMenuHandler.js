import { Markup } from 'telegraf';
import send from '../send.js';

export async function mainMenuHandler(ctx) {
  const message = `
    🦈 <b>SharkFlow Bot</b>
    Выберите действие:
  `.trim();

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('👤 Мой профиль', 'show_profile'),
      Markup.button.callback('🗂 Мои доски', 'show_boards')
    ],
    [
      Markup.button.callback('🚪 Выйти из аккаунта', 'logout'),
      Markup.button.callback('ℹ️ Помощь', 'help')
    ]
  ]);

  await send(ctx, message, keyboard);
} 