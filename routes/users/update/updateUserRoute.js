import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { normalizeEmail } from '../../../utils/validators/normalizeEmail.js';
import {
  getConfirmationCode,
  deleteConfirmationCode,
} from '../../../store/userVerifyStore.js';
import { logUserUpdate, logUserUpdateFailure } from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../utils/helpers/validateConfirmationCode.js';

const router = Router();

router.patch('/api/users', authenticateMiddleware, async (req, res) => {
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

    if (!validateConfirmationCode(userUuid, confirmationCode, {
      failure: (uuid, reason) => logUserUpdateFailure(uuid, ipAddress, reason),
    })) {
      return res.status(400).json({ error: 'Неверный или просроченный код' });
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

    return res.json({ message: 'Данные успешно обновлены', user: updatedUser });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при обновлении пользователя',
      mappings: {
        P2002: { status: 409, message: 'Пользователь с таким email или логином уже существует' },
        P2025: { status: 404, message: 'Пользователь не найден' },
      },
      status: 500,
      message: 'Произошла внутренняя ошибка сервера при обновлении пользователя',
    });
  }
});

export default {
  path: '/',
  router,
};
