import { authenticateTelegramMiddleware } from '../../middlewares/http/authenticateTelegramMiddleware.js';
import { boardsHandler } from '../handlers/boards/boardsHandler.js';

export default function registerBoardTriggerEvent(bot) {
  bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    if (text === 'SF доски' || text === 'SF boards') {
      await authenticateTelegramMiddleware(ctx, async () => {
        await boardsHandler(ctx);
      });
    }
  });
}