bot.command('disable', async (ctx) => {
  const telegramId = ctx.from?.id;
  console.info('Инициализация отвякки...');
  console.info('для telegramId');

  const user = await prisma.user.findUnique({
    where: { telegramId },
  });

  console.info(user.telegramEnabled);

  if (!user) {
    return ctx.reply('Telegram не привязан ни к одному аккаунту.');
  }

  await prisma.user.update({
    where: { uuid: user.uuid },
    data: { telegramId: null, telegramEnabled: false },
  });

  ctx.reply('Telegram успешно отвязан от аккаунта.');
});
