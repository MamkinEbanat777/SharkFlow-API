import prisma from '../../utils/prismaConfig/prismaClient.js';
import jwt from 'jsonwebtoken';

export default function registerStartCommand(bot) {
  bot.start(async (ctx) => {
    const args = ctx.message.text.split(' ');
    const token = args[1];
    const telegramId = ctx.from.id;

    if (!token) return ctx.reply('Токен не найден');
    console.log('Привязка...');

    try {
      const { userUuid } = jwt.verify(token, process.env.JWT_TELEGRAM_SECRET);
      console.log(userUuid);
      await prisma.user.update({
        where: { uuid: userUuid },
        data: { telegramId },
      });
      ctx.reply('Telegram привязан!');
    } catch (e) {
      console.error(e);
      ctx.reply('Ошибка привязки Telegram');
    }
  });
}
