/**
 * @module telegramBot/commands/users/ivan
 * @description Команда /ivan в Telegram боте.
 */
export default function registerMeCommand(bot) {
  bot.command('ivan', async (ctx) => {
    return await ctx.reply('Мама вани');
  });
}
