import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { deleteConfirmationCode } from '../../../../store/userVerifyStore.js';
import { validateConfirmationCode } from '../../../../utils/helpers/validateConfirmationCode.js';
import { emailConfirmValidate } from '../../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../../middlewares/http/validateMiddleware.js';

const router = Router();

router.post(
  '/api/auth/google/disable',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    try {
      const userUuid = req.userUuid;
      const { confirmationCode } = req.body;

      const valid = await validateConfirmationCode(
        userUuid,
        'disableGoogle',
        confirmationCode,
      );
      if (!valid) {
        return res
          .status(400)
          .json({ error: 'Неверный или просроченный код подтверждения' });
      }

      await deleteConfirmationCode('disableGoogle', userUuid);

      const user = await prisma.user.findFirst({
        where: { uuid: userUuid, isDeleted: false },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: {
          googleSub: null,
          googleOAuthEnabled: false,
        },
      });

      return res.json({ message: 'Google успешно отвязан от вашего аккаунта' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при отвязке Google',
        status: 500,
        message: 'Произошла ошибка при отвязке Google. Попробуйте позже.',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
