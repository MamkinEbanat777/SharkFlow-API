import { Router } from 'express';
import { loginValidate } from '../../../utils/validators/loginValidate.js';
import { validateMiddleware } from '../../../middlewares/http/validateMiddleware.js';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import bcrypt from 'bcrypt';
import { createAccessToken } from '../../../utils/tokens/accessToken.js';
import { issueRefreshToken } from '../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../utils/cookie/loginCookie.js';
import { normalizeEmail } from '../../../utils/validators/normalizeEmail.js';
import {
  checkLoginRateLimit,
  incrementLoginAttempts,
  resetLoginAttempts,
} from '../../../utils/rateLimiters/authRateLimiters.js';
import {
  logLoginSuccess,
  logLoginFailure,
} from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { generateUUID } from '../../../utils/generators/generateUUID.js';
import { setUserTempData } from '../../../store/userTempData.js';

const router = Router();

router.post(
  '/api/auth/login',
  validateMiddleware(loginValidate),
  async (req, res) => {
    const ipAddress = getClientIP(req);
    const userAgent = req.get('user-agent') || null;
    const { user } = req.validatedBody;
    const { email, password, rememberMe } = user;
    const normalizedEmail =
      typeof email === 'string' ? normalizeEmail(email) : null;

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Некорректный email' });
    }

    const rateLimitCheck = checkLoginRateLimit(ipAddress, normalizedEmail);
    if (rateLimitCheck.blocked) {
      return res.status(429).json({
        error: `Слишком много попыток входа. Попробуйте через ${rateLimitCheck.timeLeft} минут`,
      });
    }

    try {
      const user = await prisma.user.findFirst({
        where: { email: normalizedEmail, isDeleted: false },
        select: {
          uuid: true,
          password: true,
          login: true,
          email: true,
          role: true,
          twoFactorEnabled: true,
        },
      });

      if (!user || !user.password) {
        incrementLoginAttempts(ipAddress, normalizedEmail);
        return res.status(401).json({ error: 'Неправильный email или пароль' });
      }

      if (!(await bcrypt.compare(password, user.password))) {
        incrementLoginAttempts(ipAddress, normalizedEmail);
        logLoginFailure(normalizedEmail, ipAddress);
        return res.status(401).json({ error: 'Неправильный email или пароль' });
      }

      if (user.twoFactorEnabled) {
        const sessionKey = generateUUID();
        await setUserTempData('twoFactorAuth', sessionKey, {
          uuid: user.uuid,
          twoFactorEnabled: user.twoFactorEnabled,
          rememberMe,
          ipAddress,
          userAgent,
          timestamp: Date.now(),
        });
        return res.status(200).json({
          twoFactorEnabled: user.twoFactorEnabled,
          sessionKey,
          message:
            'Требуется двуфакторная аутентификация. Введите код из приложения',
        });
      }

      resetLoginAttempts(ipAddress, normalizedEmail);

      const accessToken = createAccessToken(user.uuid, user.role);
      const refreshToken = await issueRefreshToken({
        res,
        userUuid: user.uuid,
        rememberMe,
        ipAddress,
        userAgent,
        referrer: req.get('Referer') || null,
      });

      res.cookie(
        'log___tf_12f_t2',
        refreshToken,
        getRefreshCookieOptions(rememberMe),
      );

      logLoginSuccess(normalizedEmail, user.uuid, ipAddress);

      return res.status(200).json({ accessToken });
    } catch (error) {
      incrementLoginAttempts(ipAddress, normalizedEmail);
      handleRouteError(res, error, {
        message: 'Ошибка при логине. Попробуйте позже',
        status: 500,
        logPrefix: 'Ошибка при логине',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
