import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { generateConfirmationCode } from '../../../utils/generators/generateConfirmationCode.js';
import { sendConfirmationEmail } from '../../../utils/mail/sendConfirmationEmail.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { setConfirmationCode } from '../../../store/userVerifyStore.js';
import { logUserDeleteRequest, logUserDeleteRequestFailure } from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';

const router = Router();

router.post(
  '/api/users/delete/confirm-deletion',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const ipAddress = getClientIP(req);

    try {
      const user = await prisma.user.findUnique({
        where: { uuid: userUuid },
      });

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

      const confirmationCode = generateConfirmationCode();

      setConfirmationCode(userUuid, confirmationCode);

      await sendConfirmationEmail({
        to: email,
        type: 'deleteUser',
        confirmationCode,
      });

      logUserDeleteRequest(userUuid, email, ipAddress);

      res
        .status(200)
        .json({ message: 'Код подтверждения отправлен на вашу почту' });
    } catch (error) {
      console.error('Ошибка при удалении аккаунта:', error);
      logUserDeleteRequestFailure(userUuid, ipAddress, 'Server error');
      res
        .status(500)
        .json({ error: 'Ошибка сервера. Пожалуйста, повторите попытку позже' });
    }
  },
);

export default {
  path: '/',
  router,
};
