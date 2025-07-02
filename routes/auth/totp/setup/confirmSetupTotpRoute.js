import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { generateConfirmationCode } from '../../../../utils/generators/generateConfirmationCode.js';
import { sendConfirmationEmail } from '../../../../utils/mail/sendConfirmationEmail.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { setConfirmationCode } from '../../../../store/userVerifyStore.js';

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

      const confirmationCode = generateConfirmationCode();
      console.log(confirmationCode);

      setConfirmationCode(userUuid, confirmationCode);
      await sendConfirmationEmail({
        to: email,
        type: 'setupTotp',
        confirmationCode,
      });

      res
        .status(200)
        .json({ message: 'Код подтверждения отправлен на вашу почту' });
    } catch (error) {
      console.error('Ошибка при отправки кода:', error);
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
