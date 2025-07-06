bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    await ctx.reply(`Вы написали: ${text}`);
  });