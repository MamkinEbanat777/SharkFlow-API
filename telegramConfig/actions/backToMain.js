import { authenticateTelegramMiddleware } from '../../middlewares/http/authenticateTelegramMiddleware.js';
import send from '../send.js';

export default function registerBackToMainAction(bot) {
  bot.action('back_to_main', authenticateTelegramMiddleware, async (ctx) => {
    await ctx.answerCbQuery(); 
    await ctx.deleteMessage(); 
    await send(ctx, 'Выберите команду или введите /help для списка.');
  });
}
