import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { generateConfirmationCode } from '../../../../utils/generators/generateConfirmationCode.js';
import { sendConfirmationEmail } from '../../../../utils/mail/sendConfirmationEmail.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { sendUserConfirmationCode } from '../../../../utils/helpers/sendUserConfirmationCode.js';

const router = Router();

router.post(
  '/api/auth/totp/confirm-setup',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;

    try {
      const user = await prisma.user.findUnique({
        where: { uuid: userUuid },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const email = user.email;
      if (!email) {
        return res
          .status(400)
          .json({ error: 'Email пользователя отсутствует' });
      }

      await sendUserConfirmationCode({
        userUuid,
        type: 'setupTotp',
        loggers: {
          success: () => {},
          failure: () => {},
        }
      });

      res
        .status(200)
        .json({ message: 'Код подтверждения отправлен на вашу почту' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при отправке кода',
        status: 500,
        message: 'Ошибка при отправке кода подтверждения',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
