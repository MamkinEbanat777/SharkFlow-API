import bot from './bot.js';

export function launchTelegramBot() {
  bot.launch();
  console.log('Telegram бот запущен с webhook');
}
