import { Router } from 'express';
import { emailConfirmValidate } from '#utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '#middlewares/http/validateMiddleware.js';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { getUserTempData } from '#store/userTempData.js';
import { findUserByUuidOrThrow } from '#utils/helpers/userHelpers.js';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { deleteUserTempData } from '#store/userTempData.js';
import { validateAndDeleteConfirmationCode } from '#utils/helpers/confirmationHelpers.js';

const router = Router();

router.post(
  '/auth/oauth/google/confirm-connect',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const userUuid = req.userUuid;
    try {
      const validation = await validateAndDeleteConfirmationCode(
        userUuid,
        'connectGoogle',
        confirmationCode,
      );
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const storedData = await getUserTempData('connectGoogle', userUuid);
      if (!storedData) {
        return res.status(400).json({ error: 'Код истёк или не найден' });
      }

      await deleteUserTempData('connectGoogle', userUuid);

      const { googleSub, normalizedGoogleEmail } = storedData;

      const user = await findUserByUuidOrThrow(userUuid);

      // Вместо обновления пользователя обновляем/создаём UserOAuth
      await prisma.userOAuth.upsert({
        where: { provider_providerId: { provider: 'google', providerId: googleSub } },
        update: { userId: user.id, email: normalizedGoogleEmail, enabled: true },
        create: { userId: user.id, provider: 'google', providerId: googleSub, email: normalizedGoogleEmail, enabled: true },
      });

      res.status(200).json({
        message: 'Код подтверждения верен, привязка Google успешна',
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при подтверждении Google OAuth',
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
