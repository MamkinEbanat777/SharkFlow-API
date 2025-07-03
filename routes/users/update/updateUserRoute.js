import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { normalizeEmail } from '../../../utils/validators/normalizeEmail.js';
import {
  logUserUpdate,
  logUserUpdateFailure,
} from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../utils/helpers/validateConfirmationCode.js';
import { emailConfirmValidate } from '../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../middlewares/http/validateMiddleware.js';
import { deleteConfirmationCode } from '../../../store/userVerifyStore.js';

const router = Router();

router.patch(
  '/api/users',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const userUuid = req.userUuid;
    const ipAddress = getClientIP(req);

    try {
      if (!userUuid) {
        return res
          .status(400)
          .json({ error: 'UUID пользователя не найден в токене' });
      }

      const { confirmationCode, updatedFields } = req.body;
      const { login, email } = updatedFields || {};
      const trimmedLogin = typeof login === 'string' ? login.trim() : undefined;
      const normalizedEmail =
        typeof email === 'string' ? normalizeEmail(email) : undefined;

      if (email !== undefined && !normalizedEmail) {
        return res.status(400).json({ error: 'Некорректный email' });
      }

      if (typeof confirmationCode !== 'string') {
        return res.status(400).json({ error: 'Код подтверждения обязателен' });
      }

      const valid = await validateConfirmationCode(userUuid, confirmationCode);
      if (!valid) {
        return res
          .status(400)
          .json({ error: 'Неверный или просроченный код подтверждения' });
      }

      const dataToUpdate = {};
      if (trimmedLogin) dataToUpdate.login = trimmedLogin;
      if (normalizedEmail) dataToUpdate.email = normalizedEmail;

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }

      const updatedUser = await prisma.user.update({
        where: { uuid: userUuid },
        data: dataToUpdate,
        select: { login: true, email: true },
      });

      logUserUpdate(userUuid, dataToUpdate, ipAddress);

      deleteConfirmationCode(userUuid);

      return res.json({
        message: 'Данные успешно обновлены',
        user: updatedUser,
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при обновлении пользователя',
        mappings: {
          P2002: {
            status: 409,
            message: 'Пользователь с таким email или логином уже существует',
          },
          P2025: { status: 404, message: 'Пользователь не найден' },
        },
        status: 500,
        message:
          'Произошла внутренняя ошибка сервера при обновлении пользователя',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
