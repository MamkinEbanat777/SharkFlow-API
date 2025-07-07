import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { emailConfirmValidate } from '../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../middlewares/http/validateMiddleware.js';
import {
  getUserTempData,
  deleteUserTempData,
} from '../../../store/userTempData.js';
import {
  logRegistrationSuccess,
  logRegistrationFailure,
} from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../utils/helpers/validateConfirmationCode.js';
import { deleteConfirmationCode } from '../../../store/userVerifyStore.js';

const router = Router();

router.post(
  '/api/users',
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const regUuid = req.cookies.sd_f93j8f___;
    const guestUuid = req.cookies.log___sf_21s_t1;
    const ipAddress = getClientIP(req);

    try {
      if (!regUuid) {
        return res.status(400).json({ error: 'Регистрация не найдена' });
      }

      const storedData = await getUserTempData('registration', regUuid);
      if (!storedData) {
        return res.status(400).json({ error: 'Код истёк или не найден' });
      }

      const { email, login, hashedPassword } = storedData;

      const success = await validateConfirmationCode(
        regUuid,
        'registration',
        confirmationCode,
        {
          failure: (uuid, reason) =>
            logRegistrationFailure(email, ipAddress, reason),
        },
      );

      if (!success) {
        return res.status(400).json({ error: 'Неверный код' });
      }

      let userRecord;

      const existingUser = await prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        if (existingUser.isDeleted) {
          return res.status(403).json({
            error:
              'Аккаунт с этой почтой был удален. Пожалуйста, используйте другую почту или обратитесь в поддержку для восстановления аккаунта.',
          });
        } else {
          return res
            .status(409)
            .json({ error: 'Пользователь с таким email уже существует' });
        }
      }

      if (guestUuid) {
        const existingGuest = await prisma.user.findFirst({
          where: { uuid: guestUuid, isDeleted: false, role: 'guest' },
        });

        if (existingGuest && existingGuest.role === 'guest') {
          userRecord = await prisma.user.update({
            where: { uuid: guestUuid },
            data: {
              email,
              login,
              password: hashedPassword,
              role: 'user',
            },
          });
          res.clearCookie('log___sf_21s_t1');
        }
      }

      if (!userRecord) {
        userRecord = await prisma.user.create({
          data: {
            email,
            login,
            password: hashedPassword,
          },
        });
      }

      await prisma.refreshToken.deleteMany({
        where: {
          userId: userRecord.id,
          revoked: false,
        },
      });

      await deleteUserTempData('registration', regUuid);

      await deleteConfirmationCode('registration', regUuid);

      logRegistrationSuccess(email, userRecord.id, ipAddress);

      return res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при создании пользователя',
        mappings: {
          P2002: {
            status: 409,
            message: 'Пользователь с таким email или логином уже существует',
          },
        },
        status: 500,
        message:
          'Произошла внутренняя ошибка сервера при создании пользователя',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
