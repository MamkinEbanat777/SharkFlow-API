import { Telegraf } from 'telegraf';
import registerStartCommand from './commands/start.js';
import { telegramToken } from '../utils/tokens/telegramToken.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

registerStartCommand(bot);

if (process.env.NODE_ENV !== 'production') {
  const testUuid = '156a5ce1-22b1-4c5b-a9f6-e671ca070c35';
  const token = telegramToken(testUuid);
  console.log('Тестовый Telegram токен:', token);
  console.log(`https://t.me/TODO_SHARKFLOW_BOT?start=${token}`);
}

export default bot;
