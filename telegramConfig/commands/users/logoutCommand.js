import { authenticateTelegramMiddleware } from '../../../middlewares/http/authenticateTelegramMiddleware.js';
import { logoutHandler } from '../../handlers/users/logoutHandler.js';

export default function registerLogoutCommand(bot) {
  bot.command('logout', authenticateTelegramMiddleware, logoutHandler);
}
