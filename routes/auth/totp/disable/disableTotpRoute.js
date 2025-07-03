import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import {
  getConfirmationCode,
  deleteConfirmationCode,
} from '../../../../store/userVerifyStore.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../../utils/helpers/validateConfirmationCode.js';

const router = Router();

router.post(
  '/api/auth/totp/disable',
  authenticateMiddleware,
  async (req, res) => {
    try {
      const userUuid = req.userUuid;
      const { confirmationCode } = req.body;
      console.log(req.body);

      if (!confirmationCode) {
        return res.status(400).json({ error: 'Код подтверждения обязателен' });
      }

      if (!validateConfirmationCode(userUuid, confirmationCode)) {
        return res.status(400).json({ error: 'Неверный или просроченный код подтверждения' });
      }

      deleteConfirmationCode(userUuid);

      await prisma.user.update({
        where: { uuid: userUuid, isDeleted: false },
        data: {
          twoFactorSecret: null,
          twoFactorEnabled: false,
        },
      });

      return res.json({ message: '2FA успешно отключена' });
    } catch (error) {
      handleRouteError(res, error, {
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
