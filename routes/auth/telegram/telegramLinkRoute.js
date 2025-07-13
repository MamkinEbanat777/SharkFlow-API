import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { setUserTempData } from '../../../store/userTempData.js';
import { generateUUID } from '../../../utils/generators/generateUUID.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { findUserByUuidOrThrow } from '../../../utils/helpers/userHelpers.js';

const router = Router();

router.get('/telegram/link', authenticateMiddleware, async (req, res) => {
  try {
    const userUuid = req.userUuid;

    const user = await findUserByUuidOrThrow(userUuid, { role: true });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.role === 'guest') {
      return res
        .status(403)
        .json({ error: 'Гости не могут привязывать Telegram' });
    }

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
