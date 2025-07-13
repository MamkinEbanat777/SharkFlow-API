/**
 * @module telegramBot/commands/help/help
 * @description Команда /help в Telegram боте.
 */
import { showHelpHandler } from '../../handlers/users/showHelpHandler.js';

export default function registerHelpCommand(bot) {
  bot.command('help', showHelpHandler)
} 