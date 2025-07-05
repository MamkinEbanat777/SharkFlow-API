import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';

const router = Router();

router.delete(
  '/api/telegram/unlink',
  authenticateMiddleware,
  async (req, res) => {
    try {
      await prisma.user.update({
        where: { uuid: req.userUuid },
        data: { telegramId: null },
      });

      res.json({ message: 'Telegram успешно отвязан' });
    } catch (e) {
      console.error('[telegram/unlink] Ошибка:', e);
      res.status(500).json({ error: 'Не удалось отвязать Telegram' });
    }
  },
);

export default {
  path: '/',
  router,
};
