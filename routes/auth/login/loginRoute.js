import { Router } from 'express';
import { loginValidate } from '../../../utils/validators/loginValidate.js';
import { validateMiddleware } from '../../../middlewares/http/validateMiddleware.js';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import bcrypt from 'bcrypt';
import { createAccessToken } from '../../../utils/tokens/accessToken.js';
import { createRefreshToken } from '../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../utils/cookie/loginCookie.js';
import { normalizeEmail } from '../../../utils/validators/normalizeEmail.js';

const router = Router();

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 5 * 60 * 1000; 

const checkRateLimit = (ipAddress, email) => {
  const key = `${ipAddress}-${email}`;
  const attempts = loginAttempts.get(key);
  
  if (attempts && attempts.count >= MAX_ATTEMPTS) {
    const timeLeft = attempts.blockedUntil - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000 / 60) 
      };
    } else {
      loginAttempts.delete(key);
    }
  }
  return { blocked: false };
};

const incrementAttempts = (ipAddress, email) => {
  const key = `${ipAddress}-${email}`;
  const attempts = loginAttempts.get(key) || { count: 0, blockedUntil: 0 };
  
  attempts.count++;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.blockedUntil = Date.now() + BLOCK_DURATION;
  }
  
  loginAttempts.set(key, attempts);
  
  setTimeout(() => {
    loginAttempts.delete(key);
  }, BLOCK_DURATION);
};

const resetAttempts = (ipAddress, email) => {
  const key = `${ipAddress}-${email}`;
  loginAttempts.delete(key);
};

router.post(
  '/api/auth/login',
  validateMiddleware(loginValidate),
  async (req, res) => {
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',').shift() ||
      req.socket.remoteAddress ||
      null;
    const userAgent = req.get('user-agent') || null;
    const { user } = req.validatedBody;
    const { email, password, rememberMe } = user;
    const normalizedEmail =
      typeof email === 'string' ? normalizeEmail(email) : null;

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Некорректный email' });
    }

    const rateLimitCheck = checkRateLimit(ipAddress, normalizedEmail);
    if (rateLimitCheck.blocked) {
      return res.status(429).json({ 
        error: `Слишком много попыток входа. Попробуйте через ${rateLimitCheck.timeLeft} минут` 
      });
    }

    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        incrementAttempts(ipAddress, normalizedEmail);
        return res.status(401).json({ error: 'Неправильный email или пароль' });
      }

      resetAttempts(ipAddress, normalizedEmail);

      const accessToken = createAccessToken(user.uuid);
      const refreshToken = createRefreshToken(user.uuid, rememberMe);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          expiresAt: new Date(
            Date.now() +
              (rememberMe
                ? Number(process.env.SESSION_EXPIRES_REMEMBER_ME)
                : Number(process.env.SESSION_EXPIRES_DEFAULT)),
          ),
          revoked: false,
          rememberMe: rememberMe,
          ipAddress,
          userAgent,
          userId: user.id,
        },
      });

      res.cookie(
        'log___tf_12f_t2',
        refreshToken,
        getRefreshCookieOptions(rememberMe),
      );

      return res.status(200).json({ accessToken });
    } catch (error) {
      console.error('Ошибка при логине:', error);
      incrementAttempts(ipAddress, normalizedEmail);
      res.status(500).json({ error: 'Ошибка сервера. Пожалуйста, попробуйте' });
    }
  },
);

export default {
  path: '/',
  router,
};
