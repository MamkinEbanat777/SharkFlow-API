/**
 * @module telegramBot/commands/users/me
 * @description Команда /me в Telegram боте.
 */
import { authenticateTelegramMiddleware } from '#middlewares/http/authenticateTelegramMiddleware.js';
import { showProfileHandler } from '#telegramBot/handlers/users/showProfileHandler.js';

export default function registerMeCommand(bot) {
  bot.command('profile', authenticateTelegramMiddleware, showProfileHandler);
}
