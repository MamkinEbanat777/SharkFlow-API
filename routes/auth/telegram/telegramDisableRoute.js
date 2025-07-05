import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';

const router = Router();

router.delete(
  '/api/telegram/unlink',
  authenticateMiddleware,
  async (req, res) => {
    try {
      const userUuid = req.userUuid;

      const user = await prisma.user.findFirst({
        where: { uuid: userUuid, isDeleted: false },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      if (!user.telegramId) {
        return res.status(400).json({ error: 'Telegram не был привязан' });
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: { telegramId: null, telegramEnabled: false },
      });

      return res.json({ message: 'Telegram успешно отвязан' });
    } catch (error) {
      console.error('[telegram/unlink] Ошибка:', error);
      handleRouteError(res, error, {
        logPrefix: 'Не удалось отвязать Telegram',
        status: 500,
        message: 'Не удалось отвязать Telegram. Попробуйте позже.',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
