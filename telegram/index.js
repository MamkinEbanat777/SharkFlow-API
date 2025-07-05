import bot from './bot.js';

export function launchTelegramBot() {
  bot.launch({
    webhook: {
      domain: process.env.BASE_URL,
      port: process.env.PORT || 3000,
      hookPath: '/telegram/webhook',
    },
  });
  console.log('Telegram бот запущен с webhook');
}
