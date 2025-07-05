bot.command('disable', async (ctx) => {
  const telegramId = ctx.from?.id;

  const user = await prisma.user.findUnique({
    where: { telegramId },
  });

  if (!user) {
    return ctx.reply('Telegram не привязан ни к одному аккаунту.');
  }

  await prisma.user.update({
    where: { uuid: user.uuid },
    data: { telegramId: null },
  });

  ctx.reply('Telegram успешно отвязан от аккаунта.');
});
