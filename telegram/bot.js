import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import prisma from '../utils/prismaConfig/prismaClient.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start(async (ctx) => {
  const args = ctx.message.text.split(' ');
  const token = args[1];
  const telegramId = ctx.from.id;

  if (!token) return ctx.reply('Токен не найден');

  try {
    const { userUuid } = jwt.verify(token, process.env.JWT_SECRET);
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

export default bot;
