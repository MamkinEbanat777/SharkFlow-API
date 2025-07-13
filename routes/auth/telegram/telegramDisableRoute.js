import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { findUserByUuidOrThrow } from '../../../utils/helpers/userHelpers.js';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import {
  logTelegramUnlinkSuccess,
  logTelegramUnlinkError,
} from '../../../utils/loggers/telegramLoggers.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';

const router = Router();

router.delete('/telegram/unlink', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);

  try {
    const user = await findUserByUuidOrThrow(userUuid);

    if (!user.telegramId) {
      return res.status(400).json({ error: 'Telegram не был привязан' });
    }

    await prisma.user.update({
      where: { uuid: userUuid },
      data: { telegramId: null, telegramEnabled: false },
    });

    logTelegramUnlinkSuccess(userUuid, ipAddress);
    return res.json({ message: 'Telegram успешно отвязан' });
  } catch (error) {
    logTelegramUnlinkError(userUuid, ipAddress, error);
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при отвязке Telegram',
      status: 500,
      message: 'Произошла ошибка при отвязке Telegram',
    });
  }
});

export default {
  path: '/',
  router,
};
