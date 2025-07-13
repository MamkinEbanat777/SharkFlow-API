/**
 * @module telegramBot/commands/boards/getBoards
 * @description Команда для получения досок в Telegram боте.
 */
import { authenticateTelegramMiddleware } from '../../../middlewares/http/authenticateTelegramMiddleware.js';
import { getBoardsHandler } from '../../handlers/boards/getBoardsHandler.js';

export default function registerGetBoardsCommand(bot) {
  bot.command('boards', authenticateTelegramMiddleware, getBoardsHandler);
}
