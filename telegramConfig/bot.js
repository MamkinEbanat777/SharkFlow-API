import { Telegraf } from 'telegraf';
import registerStartCommand from './commands/start.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

registerStartCommand(bot);

export default bot;
