import { Telegraf } from 'telegraf';
import path from 'path';
import { loadConfig } from './loadConfig.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const commandsDir = path.resolve(__dirname, 'commands');
const eventsDir = path.resolve(__dirname, 'events');
const menusDir = path.resolve(__dirname, 'menus');
const actionsDir = path.resolve(__dirname, 'actions');

await loadConfig(bot, commandsDir);
await loadConfig(bot, eventsDir);
await loadConfig(bot, menusDir);
await loadConfig(bot, actionsDir);

export default bot;
