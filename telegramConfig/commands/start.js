import prisma from '../../utils/prismaConfig/prismaClient.js';
import {
  getUserTempData,
  deleteUserTempData,
} from '../../store/userTempData.js';

export default function registerStartCommand(bot) {
  bot.start(async (ctx) => {
    console.info('Получена команда /start с текстом:', ctx.message.text);
    const args = ctx.message.text.split(' ');
    console.info('args', args);
    const nonce = args[1];
    console.info('nonce', nonce);
    const telegramId = ctx.from.id;
    console.info('telegramId', telegramId);

    if (!nonce) {
      return ctx.reply(
        'Пожалуйста пройдите авторизацию на нашем сайте: https://sharkflow.onrender.com/',
      );
    }

    try {
      const userUuid = await getUserTempData('telegramAuth', nonce);

      if (!userUuid) {
        return ctx.reply('Неверный или просроченный токен');
      }

      await deleteUserTempData('telegramAuth', nonce);

      await prisma.user.update({
        where: { uuid: userUuid },
        data: { telegramId },
      });

      ctx.reply('Telegram успешно привязан!');
    } catch (e) {
      console.error(e);
      ctx.reply('Ошибка привязки Telegram');
    }
  });
}
