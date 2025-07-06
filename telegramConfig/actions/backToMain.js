import { authenticateTelegramMiddleware } from '../../middlewares/http/authenticateTelegramMiddleware.js';

export default function registerBackToMainAction(bot) {
  bot.action('back_to_main', authenticateTelegramMiddleware, async (ctx) => {
    await ctx.answerCbQuery(); 
    await ctx.deleteMessage(); 
    await ctx.reply('Выберите команду или введите /help для списка.');
  });
}
