import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { setUserTempData } from '../../../store/userTempData.js';
import { generateUUID } from '../../../utils/generators/generateUUID.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';

const router = Router();

router.get('/api/telegram/link', authenticateMiddleware, async (req, res) => {
  try {
    const userUuid = req.userUuid;

    const nonce = generateUUID();

    await setUserTempData('telegramAuth', nonce, { userUuid });

    const link = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${nonce}`;

    return res.json({ link });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка генерации ссылки',
      status: 500,
      message: 'Ошибка генерации ссылки. Попробуйте позже.',
    });
  }
});

export default {
  path: '/',
  router,
};
