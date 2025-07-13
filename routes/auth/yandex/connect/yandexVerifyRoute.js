import { Router } from 'express';
import { emailConfirmValidate } from '../../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../../middlewares/http/validateMiddleware.js';
import { deleteConfirmationCode } from '../../../../store/userVerifyStore.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../../utils/helpers/validateConfirmationCode.js';
import { getUserTempData } from '../../../../store/userTempData.js';
import { findUserByUuid } from '../../../../utils/helpers/userHelpers.js';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { deleteUserTempData } from '../../../../store/userTempData.js';

const router = Router();

router.post(
  '/api/auth/github/confirm-connect',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const userUuid = req.userUuid;
    try {
      const valid = await validateConfirmationCode(
        userUuid,
        'connectGithub',
        confirmationCode,
      );
      if (!valid) {
        return res
          .status(400)
          .json({ error: 'Неверный или просроченный код подтверждения' });
      }

      await deleteConfirmationCode('connectGithub', userUuid);

      const storedData = await getUserTempData('connectGithub', userUuid);
      if (!storedData) {
        return res.status(400).json({ error: 'Код истёк или не найден' });
      }

      await deleteUserTempData('connectGithub', userUuid);

      const { githubId, normalizedGithubEmail } = storedData;

      const user = await findUserByUuid(userUuid);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: {
          githubEmail: normalizedGithubEmail,
          githubId,
          githubOAuthEnabled: true,
        },
      });

      res.status(200).json({
        message: 'Код подтверждения верен, привязка Github успешна',
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при подтверждении Github OAuth',
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
