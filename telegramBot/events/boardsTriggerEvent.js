/**
 * @module telegramBot/events/boardsTrigger
 * @description Событие триггера досок в Telegram боте.
 */
import { authenticateTelegramMiddleware } from '#middlewares/http/authenticateTelegramMiddleware.js';
import { getBoardsHandler } from '#telegramBot/handlers/boards/getBoardsHandler.js';

export default function registerBoardTriggerEvent(bot) {
  bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    if (text === 'SF доски' || text === 'SF boards') {
      await authenticateTelegramMiddleware(ctx, async () => {
        await getBoardsHandler(ctx);
      });
    }
  });
}