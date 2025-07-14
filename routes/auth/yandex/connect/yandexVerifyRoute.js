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
  '/auth/oauth/yandex/confirm-connect',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const userUuid = req.userUuid;
    try {
      const valid = await validateConfirmationCode(
        userUuid,
        'connectYandex',
        confirmationCode,
      );
      if (!valid) {
        return res
          .status(400)
          .json({ error: 'Неверный или просроченный код подтверждения' });
      }

      await deleteConfirmationCode('connectYandex', userUuid);

      const storedData = await getUserTempData('connectYandex', userUuid);
      if (!storedData) {
        return res.status(400).json({ error: 'Код истёк или не найден' });
      }

      await deleteUserTempData('connectYandex', userUuid);

      const { yandexId, normalizedYandexEmail } = storedData;

      const user = await findUserByUuid(userUuid);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: {
          yandexEmail: normalizedYandexEmail,
          yandexId,
          yandexOAuthEnabled: true,
        },
      });

      res.status(200).json({
        message: 'Код подтверждения верен, привязка Yandex успешна',
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при подтверждении Yandex OAuth',
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
