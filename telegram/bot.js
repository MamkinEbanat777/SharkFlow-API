import { Telegraf } from 'telegraf';
import registerStartCommand from './commands/start.js';
import { telegramToken } from '../utils/tokens/telegramToken.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

registerStartCommand(bot);

if (process.env.NODE_ENV !== 'production') {
  const testUuid = '94f12462-8166-4b84-9e03-ea41b9920ac5';
  const token = telegramToken(testUuid);
  console.log('Тестовый Telegram токен:', token);
  console.log(`https://t.me/TODO_SHARKFLOW_BOT?start=${token}`);
}

export default bot;
