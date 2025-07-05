import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { createAccessToken } from '../../../../utils/tokens/accessToken.js';
import { issueRefreshToken } from '../../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../../utils/cookie/loginCookie.js';
import {
  incrementLoginAttempts,
  resetLoginAttempts,
} from '../../../../utils/rateLimiters/authRateLimiters.js';
import { logLoginSuccess } from '../../../../utils/loggers/authLoggers.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { deleteUserTempData } from '../../../../store/userTempData.js';
import { decrypt } from '../../../../utils/crypto/decrypt.js';
import speakeasy from 'speakeasy';
import { getUserTempData } from '../../../../store/userTempData.js';
import { createCsrfToken } from '../../../../utils/tokens/csrfToken.js';

const router = Router();

router.post('/api/auth/totp/verify', async (req, res) => {
  const { totpCode, sessionKey } = req.body;

  try {
    const session = await getUserTempData('twoFactorAuth', sessionKey);
    if (!session) {
      return res
        .status(401)
        .json({ error: 'Сессия 2FA истекла или не найдена' });
    }

    if (!/^\d{6}$/.test(totpCode)) {
      return res.status(400).json({ error: 'Код должен состоять из 6 цифр' });
    }

    const { uuid, rememberMe, ipAddress, userAgent } = session;

    const user = await prisma.user.findFirst({
      where: { uuid: uuid, isDeleted: false },
      select: {
        uuid: true,
        password: true,
        login: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res
        .status(400)
        .json({ error: '2FA не настроена для пользователя' });
    }

    const decryptedSecret = decrypt(user.twoFactorSecret);

    const isValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: totpCode.trim(),
      window: 1,
    });

    if (!isValid) {
      return res.status(403).json({ error: 'Неверный или просроченный код' });
    }

    resetLoginAttempts(ipAddress, user.email);

    const accessToken = createAccessToken(user.uuid, user.role);
    const csrfToken = createCsrfToken(user.uuid, user.role);
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

    logLoginSuccess(user.email, user.uuid, ipAddress);
    await deleteUserTempData('twoFactorAuth', sessionKey);
    return res.status(200).json({ accessToken, csrfToken });
  } catch (error) {
    incrementLoginAttempts(ipAddress, user.email);
    handleRouteError(res, error, {
      message: 'Ошибка при логине. Попробуйте позже',
      status: 500,
      logPrefix: 'Ошибка при логине',
    });
  }
});

export default {
  path: '/',
  router,
};
