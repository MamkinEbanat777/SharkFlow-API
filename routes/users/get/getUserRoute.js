import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { logUserFetch } from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';

const router = Router();

router.get('/api/users', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);

  try {
    if (!userUuid) {
      return res
        .status(400)
        .json({ error: 'UUID пользователя не найден в токене' });
    }

    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
      select: {
        login: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    logUserFetch(userUuid, ipAddress);

    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
