import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { setUserTempData } from '../../../store/userTempData.js';
import { generateUUID } from '../../../utils/generators/generateUUID.js';

const router = Router();

router.get('/api/telegram/link', authenticateMiddleware, async (req, res) => {
  try {
    const userUuid = req.userUuid;

    const nonce = generateUUID();

    await setUserTempData('telegramAuth', nonce, { userUuid });

    const link = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${nonce}`;

    res.json({ link });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка генерации ссылки' });
  }
});

export default {
  path: '/',
  router,
};
