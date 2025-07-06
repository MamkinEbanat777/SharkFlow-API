import { Router } from 'express';
import { findUserByUuidOrThrow } from '../../../../utils/helpers/userHelpers.js';
import { createAuthTokens, setAuthCookies } from '../../../../utils/helpers/authHelpers.js';
import {
  incrementLoginAttempts,
  resetLoginAttempts,
} from '../../../../utils/rateLimiters/authRateLimiters.js';
import { logLoginSuccess } from '../../../../utils/loggers/authLoggers.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { deleteUserTempData } from '../../../../store/userTempData.js';
import { getUserTempData } from '../../../../store/userTempData.js';
import { verifyTotpCode, validateTotpCodeFormat } from '../../../../utils/helpers/totpHelpers.js';

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

    if (!validateTotpCodeFormat(totpCode)) {
      return res.status(400).json({ error: 'Код должен состоять из 6 цифр' });
    }

    const { uuid, rememberMe, ipAddress, userAgent } = session;

    const user = await findUserByUuidOrThrow(uuid, {
      uuid: true,
      password: true,
      login: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      twoFactorSecret: true,
    });

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res
        .status(400)
        .json({ error: '2FA не настроена для пользователя' });
    }

    if (!verifyTotpCode(user, totpCode)) {
      return res.status(403).json({ error: 'Неверный или просроченный код' });
    }

    resetLoginAttempts(ipAddress, user.email);

    const tokens = await createAuthTokens(user, rememberMe, req);
    setAuthCookies(res, tokens.refreshToken, rememberMe);

    logLoginSuccess(user.email, user.uuid, ipAddress);
    await deleteUserTempData('twoFactorAuth', sessionKey);
    return res.status(200).json({ accessToken: tokens.accessToken, csrfToken: tokens.csrfToken });
  } catch (error) {
    // incrementLoginAttempts(ipAddress, user.email);
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
