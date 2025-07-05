import prisma from '../../utils/prismaConfig/prismaClient.js';
import jwt from 'jsonwebtoken';

export default function registerStartCommand(bot) {
  bot.start(async (ctx) => {
    console.info('Получена команда /start с текстом:', ctx.message.text);
    const args = ctx.message.text.split(' ');
    console.info('args', args);
    const token = args[1];
    console.info('token', token);
    const telegramId = ctx.from.id;
    console.info('telegramId', telegramId);

    if (!token) return ctx.reply('Токен не найден');
    console.info('Привязка...');

    try {
      const { userUuid } = jwt.verify(token, process.env.JWT_TELEGRAM_SECRET);
      console.info(userUuid);
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
