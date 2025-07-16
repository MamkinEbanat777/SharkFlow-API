import { Router } from 'express';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { getUserTempData } from '#store/userTempData.js';
import { deleteUserTempData } from '#store/userTempData.js';
import { validateMiddleware } from '#middlewares/http/validateMiddleware.js';
import { emailConfirmValidate } from '#utils/validators/emailConfirmValidate.js';
import { findUserByUuidOrThrow } from '#utils/helpers/userHelpers.js';
import { setUserTempData } from '#store/userTempData.js';
import {
  logAccountRestoreSuccess,
  logAccountRestoreFailure,
  logUserUpdate,
  logAccountRestoreAttempt,
} from '#utils/loggers/authLoggers.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { logRegistrationFailure } from '#utils/loggers/authLoggers.js';
import { validateAndDeleteConfirmationCode } from '#utils/helpers/confirmationHelpers.js';

const router = Router();

router.post(
  '/auth/restore/verify',
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode, restoreKey } = req.body;
    const { ipAddress, userAgent } = getRequestInfo(req);

    logAccountRestoreAttempt(restoreKey, ipAddress, userAgent);

    try {
      const storedData = await getUserTempData('restoreUser', restoreKey);
      if (!storedData) {
        logAccountRestoreFailure(
          '',
          ipAddress,
          'restoreKey истёк или не найден',
        );
        return res.status(400).json({ error: 'Код истёк или не найден' });
      }

      const { userUuid } = storedData;

      const validation = await validateAndDeleteConfirmationCode(
        userUuid,
        'restoreUser',
        confirmationCode,
        {
          failure: (uuid, reason) => logRegistrationFailure('', ipAddress, reason),
        },
      );
      if (!validation.isValid) {
        logAccountRestoreFailure('', ipAddress, validation.error || 'Неверный код подтверждения');
        return res.status(400).json({ error: validation.error || 'Неверный код' });
      }

      const user = await findUserByUuidOrThrow(userUuid, true);

      if (!user.twoFactorEnabled) {
        await prisma.user.update({
          where: { uuid: user.uuid },
          data: {
            isDeleted: false,
          },
        });
        logAccountRestoreSuccess(user.email, user.uuid, ipAddress);
        logUserUpdate(userUuid, { isDeleted: false }, ipAddress);
        await deleteUserTempData('restoreUser', restoreKey);
        return res.status(200).json({
          message: 'Пользователь успешно восстановил аккаунт',
        });
      }

      await setUserTempData('twoFactorAuth', restoreKey, {
        uuid: user.uuid,
        twoFactorEnabled: user.twoFactorEnabled,
        ipAddress,
        userAgent,
        timestamp: Date.now(),
      });

      return res.status(200).json({
        twoFactorEnabled: user.twoFactorEnabled,
        message:
          'Требуется двуфакторная аутентификация. Введите код из приложения',
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при восстановлении аккаунта пользователя',
        status: 500,
        message:
          'Произошла внутренняя ошибка сервера при восстановлении аккаунта пользователя',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
