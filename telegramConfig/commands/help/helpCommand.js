import { showHelpHandler } from '../../handlers/users/showHelpHandler.js';

export default function registerHelpCommand(bot) {
  bot.command('help', showHelpHandler)
} 