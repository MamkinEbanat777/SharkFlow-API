import { Telegraf } from 'telegraf';
import path from 'path';
import { registerHandlers } from './registerHandlers.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const commandsDir = path.resolve(__dirname, 'commands');
const eventsDir = path.resolve(__dirname, 'events');

await registerHandlers(bot, commandsDir);
await registerHandlers(bot, eventsDir);

export default bot;
