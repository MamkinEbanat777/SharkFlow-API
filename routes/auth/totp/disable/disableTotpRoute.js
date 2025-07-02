import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import {
  getConfirmationCode,
  deleteConfirmationCode,
} from '../../../../store/userVerifyStore.js';

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

      const storedCode = getConfirmationCode(userUuid);

      if (String(storedCode) !== String(confirmationCode)) {
        return res
          .status(400)
          .json({ error: 'Неверный или просроченный код подтверждения' });
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
      console.error('Ошибка при отключении 2FA:', error);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
);

export default {
  path: '/',
  router,
};
