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
import { deleteUserTempData, getUserTempData } from '#store/userTempData';

const router = Router();

router.post('/auth/totp/setup', authenticateMiddleware, async (req, res) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const userUuid = req.userUuid;
  logTotpSetupAttempt(userUuid, ipAddress, userAgent);
  try {
    const { totpCode } = req.body;

    const user = await findUserByUuidOrThrow(userUuid, false, {
      role: true,
    });

    if (user.role === 'guest') {
      logTotpSetupFailure(
        userUuid,
        ipAddress,
        'Гостевые аккаунты не могут подключать 2FA',
        userAgent,
      );
      return res.status(403).json({
        error: 'Гостевые аккаунты не могут подключать 2FA',
      });
    }

    const tempData = await getUserTempData('twoFactorPendingSecret', userUuid);
    if (!tempData?.encryptedSecret) {
      logTotpSetupFailure(
        userUuid,
        ipAddress,
        'Отсутствует временный секрет 2FA',
        userAgent,
      );
      return res.status(400).json({
        error:
          'Отсутствует временный секрет 2FA. Пожалуйста, начните процесс настройки заново.',
      });
    }

    const decryptedSecret = decrypt(tempData.encryptedSecret);

    const isValid = verifyTotpCode(
      { twoFactorSecret: decryptedSecret },
      totpCode,
    );

    if (!isValid) {
      logTotpSetupFailure(
        userUuid,
        ipAddress,
        'Неверный или просроченный код',
        userAgent,
      );
      return res.status(400).json({ error: 'Неверный или просроченный код' });
    }

    await prisma.user.update({
      where: { uuid: userUuid },
      data: {
        twoFactorSecret: decryptedSecret,
        twoFactorEnabled: true,
      },
    });

    await deleteUserTempData('twoFactorPendingSecret', userUuid);
    await clearEmailConfirmed('setupTotp', userUuid);

    logTotpSetupSuccess(userUuid, ipAddress, userAgent);
    return res.json({ success: true, message: '2FA успешно подключена' });
  } catch (error) {
    logTotpSetupFailure(
      userUuid,
      ipAddress,
      error?.message || 'unknown error',
      userAgent,
    );
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
