import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { logUserFetch } from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { findUserByUuid } from '../../../utils/helpers/userHelpers.js';
import { getUserOAuthByUserId } from '../../../utils/helpers/userHelpers.js';

const router = Router();

router.get('/users', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);

  try {
    const user = await findUserByUuid(userUuid, false, {
      id: true,
      login: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      avatarUrl: true,
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    logUserFetch(userUuid, ipAddress);

    // Получаем OAuth-статусы
    const [googleOAuth, githubOAuth, yandexOAuth] = await Promise.all([
      getUserOAuthByUserId(user.id, 'google'),
      getUserOAuthByUserId(user.id, 'github'),
      getUserOAuthByUserId(user.id, 'yandex'),
    ]);
    return res.json({
      login: user.login,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      avatarUrl: user.avatarUrl,
      googleOAuthEnabled: Boolean(googleOAuth),
      githubOAuthEnabled: Boolean(githubOAuth),
      yandexOAuthEnabled: Boolean(yandexOAuth),
    });
  } catch (error) {
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
