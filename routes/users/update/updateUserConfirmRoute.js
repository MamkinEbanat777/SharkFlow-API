import { Router } from 'express';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import {
  logUserUpdateRequest,
  logUserUpdateRequestFailure,
} from '#utils/loggers/authLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { sendUserConfirmationCode } from '#utils/helpers/sendUserConfirmationCode.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { findUserByUuidOrThrow } from '#utils/helpers/userHelpers.js';

const router = Router();

router.post(
  '/users/confirm-update',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { ipAddress } = getRequestInfo(req);

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
        type: 'updateUser',
        loggers: {
          success: (uuid, email) =>
            logUserUpdateRequest(uuid, email, ipAddress),
          failure: (uuid, reason) =>
            logUserUpdateRequestFailure(uuid, ipAddress, reason),
        },
      });

      return res
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
