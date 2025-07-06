import { Router } from 'express';
import { getClientIP } from '../../../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { sendUserConfirmationCode } from '../../../../utils/helpers/sendUserConfirmationCode.js';
import {
  logUserUpdateRequest,
  logUserUpdateRequestFailure,
} from '../../../../utils/loggers/authLoggers.js';
import { findUserByUuidOrThrow } from '../../../../utils/helpers/userHelpers.js';

const router = Router();

router.post(
  '/api/auth/google/confirm-disable',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const ipAddress = getClientIP(req);

    try {
      const user = await findUserByUuidOrThrow(userUuid);

      const email = user.email;
      if (!email) {
        logUserUpdateRequestFailure(userUuid, ipAddress, 'Email missing');
        return res
          .status(400)
          .json({ error: 'Email пользователя отсутствует' });
      }

      await sendUserConfirmationCode({
        userUuid,
        type: 'disableGoogle',
        loggers: {
          success: (uuid, email) =>
            logUserUpdateRequest(uuid, email, ipAddress),
          failure: (uuid, reason) =>
            logUserUpdateRequestFailure(uuid, ipAddress, reason),
        },
      });

      res
        .status(200)
        .json({ message: 'Код подтверждения отправлен на вашу почту' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при подтверждении обновления пользователя',
        status: 500,
        message:
          'Произошла внутренняя ошибка сервера при подтверждении обновления пользователя',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
