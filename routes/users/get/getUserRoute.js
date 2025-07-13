import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { logUserFetch } from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { findUserByUuid } from '../../../utils/helpers/userHelpers.js';

const router = Router();

router.get('/users', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);

  try {
    const user = await findUserByUuid(userUuid, {
      login: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      avatarUrl: true,
      googleOAuthEnabled: true,
      googleEmail: true,
      githubEmail: true,
      telegramEnabled: true,
      githubOAuthEnabled: true,
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    logUserFetch(userUuid, ipAddress);

    return res.json(user);
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
