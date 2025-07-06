import { Markup } from 'telegraf';
import send from '../../send.js';


export async function showHelpHandler(ctx) {
    const message = `
      📚 <b>Справка по командам:</b>
      
      <b>Основные команды:</b>
      /start - Начать работу с ботом
      /menu - Главное меню
      /profile - Показать профиль
      /boards - Показать все доски
      /logout - Выйти из аккаунта
      
      <b>Или используйте кнопки в меню!</b>

      <b>Наш сайт:</b>
      <a>https://sharkflow.onrender.com</a>
    `.trim();
  
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('🔙 Назад в меню', 'back_to_main'),
    ]);
  
    await send(ctx, message, keyboard);
  } 