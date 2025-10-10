import { Router } from 'express';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { emailConfirmValidate } from '#utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '#middlewares/http/validateMiddleware.js';
import { getUserTempData, deleteUserTempData } from '#store/userTempData.js';
import {
  logRegistrationSuccess,
  logRegistrationFailure,
  logRegistrationAttempt,
} from '#utils/loggers/authLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { deleteConfirmationCode } from '#store/userVerifyStore.js';
import {
  GUEST_COOKIE_NAME,
  REGISTER_COOKIE_NAME,
} from '#config/cookiesConfig.js';
import { getRegistrationCookieOptions } from '#utils/cookie/registerCookie.js';
import { getGuestCookieOptions } from '#utils/cookie/guestCookie.js';
import { validateAndDeleteConfirmationCode } from '#utils/helpers/confirmationHelpers.js';

const router = Router();

router.post(
  '/users',
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const regUuid = req.cookies[REGISTER_COOKIE_NAME];
    const guestUuid = req.cookies[GUEST_COOKIE_NAME];
    const { ipAddress, userAgent } = getRequestInfo(req);

    logRegistrationAttempt('unknown', ipAddress, userAgent, regUuid, guestUuid);

    try {
      if (!regUuid) {
        logRegistrationFailure(
          'unknown',
          ipAddress,
          'Регистрация просрочена: нет regUuid',
        );
        return res.status(400).json({
          error: 'Регистрация просрочена. Пожалуйста попробуйте еще раз',
        });
      }

      const storedData = await getUserTempData('registration', regUuid);
      if (!storedData) {
        logRegistrationFailure('unknown', ipAddress, 'Нет storedData');
        return res.status(400).json({ error: 'Код истёк или не найден' });
      }

      const { email, login, hashedPassword } = storedData;

      logRegistrationAttempt(email, ipAddress, userAgent, regUuid, guestUuid);

      const validation = await validateAndDeleteConfirmationCode(
        regUuid,
        'registration',
        confirmationCode,
        {
          failure: (uuid, reason) =>
            logRegistrationFailure(email, ipAddress, reason),
        },
      );
      if (!validation.isValid) {
        logRegistrationFailure(email, ipAddress, 'Неверный код');
        return res
          .status(400)
          .json({ error: validation.error || 'Неверный код' });
      }

      let userRecord;

      const existingUser = await prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        if (existingUser.isDeleted) {
          logRegistrationFailure(email, ipAddress, 'Аккаунт удалён');
          return res.status(403).json({
            error:
              'Аккаунт с этой почтой был удален. Пожалуйста, используйте другую почту или обратитесь в поддержку для восстановления аккаунта.',
          });
        } else {
          logRegistrationFailure(
            email,
            ipAddress,
            'Пользователь уже существует',
          );
          return res
            .status(409)
            .json({ error: 'Пользователь с таким email уже существует' });
        }
      }

      if (guestUuid) {
        await prisma.$transaction(async (tx) => {
          const existingGuest = await tx.user.findFirst({
            where: { uuid: guestUuid, isDeleted: false, role: 'guest' },
          });

          if (existingGuest) {
            userRecord = await tx.user.update({
              where: { uuid: guestUuid },
              data: {
                email,
                login,
                password: hashedPassword,
                role: 'user',
              },
            });

            await tx.refreshToken.deleteMany({
              where: { userId: userRecord.id, revoked: false },
            });

            res.clearCookie(GUEST_COOKIE_NAME, getGuestCookieOptions());
          }

          await deleteUserTempData('registration', regUuid);
          await deleteConfirmationCode('registration', regUuid);
        });
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

      res.clearCookie(REGISTER_COOKIE_NAME, getRegistrationCookieOptions());

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
