import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { deleteConfirmationCode } from '../../../../store/userVerifyStore.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../../utils/helpers/validateConfirmationCode.js';
import { emailConfirmValidate } from '../../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../../middlewares/http/validateMiddleware.js';

const router = Router();

router.post(
  '/api/auth/totp/disable',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    try {
      const userUuid = req.userUuid;
      const { confirmationCode } = req.body;

      const valid = await validateConfirmationCode(
        userUuid,
        'disableTotp',
        confirmationCode,
      );
      if (!valid) {
        return res
          .status(400)
          .json({ error: 'Неверный или просроченный код подтверждения' });
      }

      await deleteConfirmationCode('disableTotp', userUuid);

      const user = await prisma.user.findFirst({
        where: { uuid: userUuid, isDeleted: false },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: {
          twoFactorSecret: null,
          twoFactorEnabled: false,
        },
      });

      return res.json({ message: '2FA успешно отключена' });
    } catch (error) {
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
