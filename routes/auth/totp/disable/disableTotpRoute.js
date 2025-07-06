import { Router } from 'express';
import { findUserByUuidOrThrow } from '../../../../utils/helpers/userHelpers.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { validateAndDeleteConfirmationCode } from '../../../../utils/helpers/confirmationHelpers.js';
import { emailConfirmValidate } from '../../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../../middlewares/http/validateMiddleware.js';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';

const router = Router();

router.post(
  '/api/auth/totp/disable',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    try {
      const userUuid = req.userUuid;
      const { confirmationCode } = req.body;

      const validation = await validateAndDeleteConfirmationCode(
        userUuid,
        'disableTotp',
        confirmationCode
      );
      
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const user = await findUserByUuidOrThrow(userUuid);

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
