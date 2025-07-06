import prisma from '../../../utils/prismaConfig/prismaClient.js';
import send from '../../send.js';

export async function logoutHandler(ctx) {
  const user = ctx.state.user;

  try {
    await prisma.user.update({
      where: { uuid: user.uuid },
      data: { telegramId: null, telegramEnabled: false },
    });

    await send(ctx, '✅ Вы успешно вышли из аккаунта в Telegram!');
  } catch (error) {
    console.error('[logoutTelegram] Ошибка:', error);
    await send(ctx, '❌ Произошла ошибка. Попробуйте позже.');
  }
}
