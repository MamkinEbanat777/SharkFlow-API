import { Router } from 'express';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { normalizeEmail } from '#utils/validators/normalizeEmail.js';
import {
  logUserUpdate,
  logUserUpdateFailure,
  logUserUpdateAttempt,
} from '#utils/loggers/authLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { emailConfirmValidate } from '#utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '#middlewares/http/validateMiddleware.js';
import { findUserByUuidOrThrow } from '#utils/helpers/userHelpers.js';
import { validateAndDeleteConfirmationCode } from '#utils/helpers/confirmationHelpers.js';

const router = Router();

router.patch(
  '/users',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const userUuid = req.userUuid;
    const { ipAddress, userAgent } = getRequestInfo(req);

    try {
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

      const validation = await validateAndDeleteConfirmationCode(
        userUuid,
        'updateUser',
        confirmationCode,
      );
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const dataToUpdate = {};
      if (trimmedLogin) dataToUpdate.login = trimmedLogin;
      if (normalizedEmail) dataToUpdate.email = normalizedEmail;

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }

      logUserUpdateAttempt(userUuid, dataToUpdate, ipAddress, userAgent);

      const user = await findUserByUuidOrThrow(userUuid, false, { role: true });

      if (!user.role === 'guest') {
        return res
          .status(403)
          .json({ error: 'Нельзя обновлять данные гостевого аккаунта' });
      }

      const updateResult = await prisma.user.update({
        where: { uuid: userUuid },
        data: dataToUpdate,
      });

      if (!updateResult) {
        logUserUpdateFailure(userUuid, dataToUpdate, ipAddress);
        return res
          .status(403)
          .json({ error: 'Пользователь не найден или был удалён' });
      }

      const updatedUser = await prisma.user.findUnique({
        where: { uuid: userUuid },
        select: { login: true, email: true },
      });

      logUserUpdate(userUuid, dataToUpdate, ipAddress);

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
