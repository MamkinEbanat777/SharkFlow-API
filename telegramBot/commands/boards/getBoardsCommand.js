import { authenticateTelegramMiddleware } from '../../../middlewares/http/authenticateTelegramMiddleware.js';
import { getBoardsHandler } from '../../handlers/boards/getBoardsHandler.js';

export default function registerGetBoardsCommand(bot) {
  bot.command('boards', authenticateTelegramMiddleware, getBoardsHandler);
}
