import { Router } from 'express';
import { findUserByUuidOrThrow } from '#utils/helpers/userHelpers.js';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { validateAndDeleteConfirmationCode } from '#utils/helpers/confirmationHelpers.js';
import { emailConfirmValidate } from '#utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '#middlewares/http/validateMiddleware.js';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { logTotpDisableAttempt, logTotpDisableSuccess, logTotpDisableFailure } from '#utils/loggers/authLoggers.js';

const router = Router();

router.post(
  '/auth/totp/disable',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    try {
      const userUuid = req.userUuid;
      logTotpDisableAttempt(userUuid);
      const { confirmationCode } = req.body;

      const validation = await validateAndDeleteConfirmationCode(
        userUuid,
        'disableTotp',
        confirmationCode,
      );

      if (!validation.isValid) {
        logTotpDisableFailure(userUuid, 'Код невалиден');
        return res.status(400).json({ error: validation.error });
      }

      await findUserByUuidOrThrow(userUuid);

      await prisma.user.update({
        where: { uuid: userUuid },
        data: {
          twoFactorSecret: null,
          twoFactorEnabled: false,
        },
      });

      logTotpDisableSuccess(userUuid);
      return res.json({ message: '2FA успешно отключена' });
    } catch (error) {
      logTotpDisableFailure(req.userUuid, error?.message || 'unknown error');
      handleRouteError(res, error, {
        mappings: {
          P2025: {
            status: 404,
            message: 'Пользователь не найден',
          },
        },
        logPrefix: 'Ошибка при отключении 2FA',
        status: 500,
        message: 'Ошибка при отключении 2FA',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
