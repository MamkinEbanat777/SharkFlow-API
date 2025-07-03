import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { generateConfirmationCode } from '../../../utils/generators/generateConfirmationCode.js';
import { sendConfirmationEmail } from '../../../utils/mail/sendConfirmationEmail.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { setConfirmationCode } from '../../../store/userVerifyStore.js';
import { logUserUpdateRequest, logUserUpdateRequestFailure } from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { sendUserConfirmationCode } from '../../../utils/helpers/sendUserConfirmationCode.js';

const router = Router();

router.post(
  '/api/users/confirm-update',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const ipAddress = getClientIP(req);

    try {
      const user = await prisma.user.findUnique({
        where: { uuid: userUuid },
      });

      if (!user) {
        logUserUpdateRequestFailure(userUuid, ipAddress, 'User not found');
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const email = user.email;
      if (!email) {
        logUserUpdateRequestFailure(userUuid, ipAddress, 'Email missing');
        return res
          .status(400)
          .json({ error: 'Email пользователя отсутствует' });
      }

      const confirmationCode = generateConfirmationCode();

      await sendUserConfirmationCode({
        userUuid,
        type: 'updateUser',
        loggers: {
          success: (uuid, email) => logUserUpdateRequest(uuid, email, ipAddress),
          failure: (uuid, reason) => logUserUpdateRequestFailure(uuid, ipAddress, reason),
        }
      });

      res.status(200).json({ message: 'Код подтверждения отправлен на вашу почту' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при подтверждении обновления пользователя',
        status: 500,
        message: 'Произошла внутренняя ошибка сервера при подтверждении обновления пользователя',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
