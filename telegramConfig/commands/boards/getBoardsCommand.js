import { authenticateTelegramMiddleware } from '../../../middlewares/http/authenticateTelegramMiddleware.js';
import { boardsHandler } from '../../handlers/boards/boardsHandler.js';

export default function registerGetBoardsCommand(bot) {
  bot.command('allBoards', authenticateTelegramMiddleware, boardsHandler);
}
