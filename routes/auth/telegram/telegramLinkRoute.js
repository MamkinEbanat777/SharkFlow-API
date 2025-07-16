import { Router } from 'express';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { setUserTempData } from '#store/userTempData.js';
import { generateUUID } from '#utils/generators/generateUUID.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { findUserByUuidOrThrow } from '#utils/helpers/userHelpers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import {
  logTelegramLinkAttempt,
  logTelegramLinkSuccess,
  logTelegramLinkError,
} from '#utils/loggers/telegramLoggers.js';

const router = Router();

router.get('/telegram/link', authenticateMiddleware, async (req, res) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  try {
    const userUuid = req.userUuid;
    logTelegramLinkAttempt(userUuid, ipAddress, userAgent);

    const user = await findUserByUuidOrThrow(userUuid, false, { role: true });

    if (!user) {
      logTelegramLinkError(userUuid, ipAddress, new Error('Пользователь не найден'));
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.role === 'guest') {
      logTelegramLinkError(userUuid, ipAddress, new Error('Гости не могут привязывать Telegram'));
      return res
        .status(403)
        .json({ error: 'Гости не могут привязывать Telegram' });
    }

    const nonce = generateUUID();

    await setUserTempData('telegramAuth', nonce, { userUuid });

    const link = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${nonce}`;

    logTelegramLinkSuccess(userUuid, nonce, ipAddress);
    return res.json({ link });
  } catch (error) {
    logTelegramLinkError(req.userUuid, ipAddress, error);
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
