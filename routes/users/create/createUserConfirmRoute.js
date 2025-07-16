import { Router } from 'express';
import { registerValidate } from '#utils/validators/registerValidate.js';
import { validateMiddleware } from '#middlewares/http/validateMiddleware.js';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { setUserTempData } from '#store/userTempData.js';
import bcrypt from 'bcrypt';
import { getRegistrationCookieOptions } from '#utils/cookie/registerCookie.js';
import { generateUUID } from '#utils/generators/generateUUID.js';
import { normalizeEmail } from '#utils/validators/normalizeEmail.js';
import {
  logRegistrationRequest,
  logRegistrationFailure,
} from '#utils/loggers/authLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { sendUserConfirmationCode } from '#utils/helpers/sendUserConfirmationCode.js';
import { verifyTurnstileCaptcha } from '#utils/helpers/verifyTurnstileCaptchaHelper.js';
import { REGISTER_COOKIE_NAME } from '#config/cookiesConfig.js';

const router = Router();

router.post(
  '/users/confirm-registration',
  validateMiddleware(registerValidate),
  async (req, res) => {
    const { user, captchaToken } = req.validatedBody;
    const { email, login, password } = user;
    const { ipAddress } = getRequestInfo(req);
    if (process.env.NODE_ENV === 'production') {
      if (!captchaToken) {
        return res
          .status(400)
          .json({ error: 'Пожалуйста, подтвердите, что вы не робот!' });
      }

      const turnstileUuid = generateUUID();

      try {
        const captchaSuccess = await verifyTurnstileCaptcha(
          captchaToken,
          ipAddress,
          turnstileUuid,
        );
        if (!captchaSuccess) {
          return res
            .status(400)
            .json({ error: 'Captcha не пройдена. Попробуйте еще раз' });
        }
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
    const uuid = generateUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = normalizeEmail(email);
    const trimmedLogin = login.trim();

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: normalizedEmail, mode: 'insensitive' } },
            { login: { equals: trimmedLogin, mode: 'insensitive' } },
          ],
        },
      });

      if (existingUser) {
        if (
          existingUser.email.toLowerCase() === normalizedEmail.toLowerCase()
        ) {
          logRegistrationFailure(
            normalizedEmail,
            ipAddress,
            'Email already exists',
          );
          return res
            .status(409)
            .json({ error: 'Пользователь с таким email уже существует' });
        }
        if (existingUser.login.toLowerCase() === trimmedLogin.toLowerCase()) {
          logRegistrationFailure(
            normalizedEmail,
            ipAddress,
            'Login already taken',
          );
          return res.status(409).json({ error: 'Логин уже занят' });
        }
      }

      await sendUserConfirmationCode({
        userUuid: uuid,
        type: 'registration',
        skipUserCheck: true,
        email: normalizedEmail,
        loggers: {
          success: () => logRegistrationRequest(normalizedEmail, ipAddress),
          failure: () =>
            logRegistrationFailure(
              normalizedEmail,
              ipAddress,
              'Email send failed',
            ),
        },
      });

      await setUserTempData('registration', uuid, {
        email: normalizedEmail,
        login: trimmedLogin,
        hashedPassword,
      });

      res.cookie(REGISTER_COOKIE_NAME, uuid, getRegistrationCookieOptions());

      return res
        .status(200)
        .json({ message: 'Код подтверждения отправлен на вашу почту' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при подтверждении создания пользователя',
        status: 500,
        message:
          'Произошла внутренняя ошибка сервера при подтверждении создания пользователя',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
