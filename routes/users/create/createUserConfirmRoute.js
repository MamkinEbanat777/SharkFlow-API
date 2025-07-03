import { Router } from 'express';
import { registerValidate } from '../../../utils/validators/registerValidate.js';
import { validateMiddleware } from '../../../middlewares/http/validateMiddleware.js';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { setRegistrationData } from '../../../store/registrationStore.js';
import bcrypt from 'bcrypt';
import { getRegistrationCookieOptions } from '../../../utils/cookie/registerCookie.js';
import { generateUUID } from '../../../utils/generators/generateUUID.js';
import { generateConfirmationCode } from '../../../utils/generators/generateConfirmationCode.js';
import { sendConfirmationEmail } from '../../../utils/mail/sendConfirmationEmail.js';
import { normalizeEmail } from '../../../utils/validators/normalizeEmail.js';
import { logRegistrationRequest, logRegistrationFailure } from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { sendUserConfirmationCode } from '../../../utils/helpers/sendUserConfirmationCode.js';

const router = Router();

router.post(
  '/api/users/confirm-registration',
  validateMiddleware(registerValidate),
  async (req, res) => {
    const { user } = req.validatedBody;
    const { email, login, password } = user;
    const ipAddress = getClientIP(req);
    const uuid = generateUUID();
    const confirmationCode = generateConfirmationCode();
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
        if (existingUser.email.toLowerCase() === normalizedEmail.toLowerCase()) {
          logRegistrationFailure(normalizedEmail, ipAddress, 'Email already exists');
          return res
            .status(409)
            .json({ error: 'Пользователь с таким email уже существует' });
        }
        if (existingUser.login.toLowerCase() === trimmedLogin.toLowerCase()) {
          logRegistrationFailure(normalizedEmail, ipAddress, 'Login already taken');
          return res.status(409).json({ error: 'Логин уже занят' });
        }
      }

      setRegistrationData(uuid, {
        email: normalizedEmail,
        login: trimmedLogin,
        hashedPassword,
        confirmationCode,
      });

      await sendUserConfirmationCode({
        userUuid: uuid,
        type: 'registration',
        loggers: {
          success: () => logRegistrationRequest(normalizedEmail, ipAddress),
          failure: () => logRegistrationFailure(normalizedEmail, ipAddress, 'Email send failed'),
        }
      });

      res.cookie('sd_f93j8f___', uuid, getRegistrationCookieOptions());

      res
        .status(200)
        .json({ message: 'Код подтверждения отправлен на вашу почту' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при подтверждении создания пользователя',
        status: 500,
        message: 'Произошла внутренняя ошибка сервера при подтверждении создания пользователя',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
