export default function registerMeCommand(bot) {
  bot.command('ivan', async (ctx) => {
    return await ctx.reply('Мама вани');
  });
}
