import { Router } from 'express';
import { findUserByUuidOrThrow } from '#utils/helpers/userHelpers.js';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { clearEmailConfirmed } from '#store/emailConfirmedStore.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { verifyTotpCode } from '#utils/helpers/totpHelpers.js';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import {
  logTotpSetupAttempt,
  logTotpSetupSuccess,
  logTotpSetupFailure,
} from '#utils/loggers/authLoggers.js';

const router = Router();

router.post('/auth/totp/setup', authenticateMiddleware, async (req, res) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const userUuid = req.userUuid;
  logTotpSetupAttempt(userUuid, ipAddress, userAgent);
  try {
    const { totpCode } = req.body;

    const user = await findUserByUuidOrThrow(userUuid, false, {
      twoFactorPendingSecret: true,
      role: true,
    });

    if (!user.twoFactorPendingSecret) {
      logTotpSetupFailure(userUuid, ipAddress, 'Отсутствует ключ для завершения настройки 2FA', userAgent);
      return res.status(400).json({
        error: 'Отсутствует ключ для завершения настройки 2FA',
      });
    }

    if (user.role === 'guest') {
      logTotpSetupFailure(userUuid, ipAddress, 'Гостевые аккаунты не могут подключать 2FA', userAgent);
      return res.status(403).json({
        error: 'Гостевые аккаунты не могут подключать 2FA',
      });
    }

    if (
      !verifyTotpCode(
        { twoFactorSecret: user.twoFactorPendingSecret },
        totpCode,
      )
    ) {
      logTotpSetupFailure(userUuid, ipAddress, 'Неверный или просроченный код', userAgent);
      return res.status(400).json({ error: 'Неверный или просроченный код' });
    }

    await prisma.user.update({
      where: { uuid: userUuid },
      data: {
        twoFactorSecret: user.twoFactorPendingSecret,
        twoFactorPendingSecret: '',
        twoFactorEnabled: true,
      },
    });
    await clearEmailConfirmed('setupTotp', userUuid);
    logTotpSetupSuccess(userUuid, ipAddress, userAgent);
    return res.json({ success: true, message: '2FA успешно подключена' });
  } catch (error) {
    logTotpSetupFailure(userUuid, ipAddress, error?.message || 'unknown error', userAgent);
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при подтверждении TOTP',
      status: 500,
      message: 'Ошибка при подтверждении 2FA',
    });
  }
});

export default {
  path: '/',
  router,
};
