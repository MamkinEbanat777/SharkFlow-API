import { Router } from 'express';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { logUserFetch } from '#utils/loggers/authLoggers.js';
import { logUserFetchAttempt } from '#utils/loggers/authLoggers.js';
import { logUserFetchFailure } from '#utils/loggers/authLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { findUserByUuidOrThrow } from '#utils/helpers/userHelpers.js';
import { getUserOAuthByUserId } from '#utils/helpers/userHelpers.js';
import { getUserOAuthEnabledByUserId } from '#utils/helpers/userHelpers.js';

const router = Router();

router.get('/users', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const { ipAddress, userAgent } = getRequestInfo(req);

  logUserFetchAttempt(userUuid, ipAddress, userAgent);

  try {
    const user = await findUserByUuidOrThrow(userUuid, false, {
      id: true,
      uuid: true,
      login: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      avatarUrl: true,
    });

    logUserFetch(userUuid, ipAddress);

    const [googleOAuth, githubOAuth, yandexOAuth] = await Promise.all([
      getUserOAuthByUserId(user.id, 'google'),
      getUserOAuthByUserId(user.id, 'github'),
      getUserOAuthByUserId(user.id, 'yandex'),
    ]);

    const githubOAuthEnabled = user
      ? await getUserOAuthEnabledByUserId(user.id, 'github')
      : false;

    return res.json({
      uuid: user.uuid,
      login: user.login,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      avatarUrl: user.avatarUrl,
      googleOAuthEnabled: Boolean(googleOAuth),
      githubOAuthEnabled: Boolean(githubOAuthEnabled),
      yandexOAuthEnabled: Boolean(yandexOAuth),
    });
  } catch (error) {
    logUserFetchFailure(userUuid, ipAddress, error);
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при получении пользователя',
      status: 500,
      message: 'Ошибка сервера',
    });
  }
});

export default {
  path: '/',
  router,
};
