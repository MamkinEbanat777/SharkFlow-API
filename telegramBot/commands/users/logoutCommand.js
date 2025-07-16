/**
 * @module telegramBot/commands/users/logout
 * @description Команда /logout в Telegram боте.
 */
import { authenticateTelegramMiddleware } from '#middlewares/http/authenticateTelegramMiddleware.js';
import { logoutHandler } from '#telegramBot/handlers/users/logoutHandler.js';

export default function registerLogoutCommand(bot) {
  bot.command('logout', authenticateTelegramMiddleware, logoutHandler);
}
