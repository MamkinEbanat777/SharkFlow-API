import prisma from '../../utils/prismaConfig/prismaClient.js';
import {
  getUserTempData,
  deleteUserTempData,
} from '../../store/userTempData.js';

export default function registerStartCommand(bot) {
  bot.start(async (ctx) => {
    const authUrl = 'https://sharkflow.onrender.com/';
    const messageText = ctx.message?.text || '';
    console.info('Получена команда /start с текстом:', messageText);

    const args = messageText.split(' ');
    const nonce = args[1];
    const telegramId = ctx.from?.id;

    console.info('args:', args);
    console.info('nonce:', nonce);
    console.info('telegramId:', telegramId);

    if (!nonce || typeof nonce !== 'string' || nonce.length > 100) {
      return await ctx.reply(
        `Пожалуйста, пройдите авторизацию на нашем сайте: ${authUrl}`,
      );
    }

    try {
      const rawData = await getUserTempData('telegramAuth', nonce);

      if (!rawData) {
        return await ctx.reply(
          `Пожалуйста, пройдите авторизацию на нашем сайте: ${authUrl}`,
        );
      }

      let userUuid;
      try {
        const parsedData = JSON.parse(rawData);
        userUuid = parsedData.userUuid;
      } catch (e) {
        console.error('[start.js] Ошибка парсинга данных:', e);
        return await ctx.reply(
          'Ошибка привязки Telegram. Невозможно прочитать данные.',
        );
      }

      if (typeof userUuid !== 'string') {
        console.error(
          '[start.js] Ожидалась строка для userUuid, получено:',
          userUuid,
        );
        return await ctx.reply(
          'Ошибка привязки Telegram. Неверный формат идентификатора пользователя.',
        );
      }

      await deleteUserTempData('telegramAuth', nonce);

      const user = await prisma.user.findUnique({
        where: { uuid: userUuid },
        select: { telegramId: true },
      });

      if (!user) {
        return await ctx.reply(
          'Пользователь не найден. Возможно, срок действия ссылки истёк.',
        );
      }

      if (user.telegramId) {
        return await ctx.reply('Вы уже привязали Telegram к своему аккаунту.');
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: { telegramId },
      });

      return await ctx.reply('Telegram успешно привязан к вашему аккаунту!');
    } catch (e) {
      console.error('[start.js] Ошибка при привязке Telegram:', e);
      return await ctx.reply('Произошла внутренняя ошибка. Попробуйте позже.');
    }
  });
}
