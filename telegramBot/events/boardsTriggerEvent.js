import { authenticateTelegramMiddleware } from '../../middlewares/http/authenticateTelegramMiddleware.js';
import { getBoardsHandler } from '../handlers/boards/getBoardsHandler.js';

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