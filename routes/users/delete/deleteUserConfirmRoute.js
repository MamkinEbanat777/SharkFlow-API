import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import {
  logUserDeleteRequest,
  logUserDeleteRequestFailure,
} from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { sendUserConfirmationCode } from '../../../utils/helpers/sendUserConfirmationCode.js';
import { findUserByUuid } from '../../../utils/helpers/userHelpers.js';

const router = Router();

router.post(
  '/api/users/delete/confirm-deletion',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const ipAddress = getClientIP(req);

    try {
      const user = await findUserByUuid(userUuid, { email: true });

      if (!user) {
        logUserDeleteRequestFailure(userUuid, ipAddress, 'User not found');
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const email = user.email;
      if (!email) {
        logUserDeleteRequestFailure(userUuid, ipAddress, 'Email missing');
        return res
          .status(400)
          .json({ error: 'Email пользователя отсутствует' });
      }

      await sendUserConfirmationCode({
        userUuid,
        type: 'deleteUser',
        loggers: {
          success: (uuid, email) =>
            logUserDeleteRequest(uuid, email, ipAddress),
          failure: (uuid, reason) =>
            logUserDeleteRequestFailure(uuid, ipAddress, reason),
        },
      });

      return res
        .status(200)
        .json({ message: 'Код подтверждения отправлен на вашу почту' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при подтверждении удаления пользователя',
        status: 500,
        message:
          'Произошла внутренняя ошибка сервера при подтверждении удаления пользователя',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
