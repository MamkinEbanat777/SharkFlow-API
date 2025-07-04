import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { emailConfirmValidate } from '../../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../../middlewares/http/validateMiddleware.js';
import { deleteConfirmationCode } from '../../../../store/userVerifyStore.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../../utils/helpers/validateConfirmationCode.js';
import { getUserTempData } from '../../../../store/userTempData.js';

const router = Router();

router.post(
  '/api/auth/google/confirm-connect',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const userUuid = req.userUuid;
    try {
      const valid = await validateConfirmationCode(
        userUuid,
        'connectGoogle',
        confirmationCode,
      );
      if (!valid) {
        return res
          .status(400)
          .json({ error: 'Неверный или просроченный код подтверждения' });
      }

      await deleteConfirmationCode('connectGoogle', userUuid);

      const storedData = await getUserTempData('connectGoogle', userUuid);
      if (!storedData) {
        return res.status(400).json({ error: 'Код истёк или не найден' });
      }
      const { googleSub, normalizedGoogleEmail } = storedData;

      const user = await prisma.user.findFirst({
        where: { uuid: userUuid, isDeleted: false },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь' });
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: {
          googleEmail: normalizedGoogleEmail,
          googleSub,
          googleOAuthEnabled: true,
        },
      });

      res.status(200).json({
        message: 'Код подтверждения верен, привязка Google успешна',
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при регистрации',
        status: 500,
        message: 'Ошибка при проверке кода подтверждения',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
