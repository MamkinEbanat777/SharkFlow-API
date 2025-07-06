import { authenticateTelegramMiddleware } from '../../../middlewares/http/authenticateTelegramMiddleware.js';
import { mainMenuHandler } from '../../handlers/mainMenuHandler.js';

export default function registerMenuCommand(bot) {
  bot.command('menu', authenticateTelegramMiddleware, mainMenuHandler);
} 