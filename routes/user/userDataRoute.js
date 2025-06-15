import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

const router = Router();

router.post('/user', authenticateMiddleware, async (req, res) => {
  try {
    const userUuid = req.userUuid;
    if (!userUuid) {
      return res
        .status(400)
        .json({ error: 'UUID пользователя не найден в токене' });
    }

    const user = await prisma.user.findUnique({
      where: { uuid: req.userUuid },
      select: {
        login: true,
      },
    });
    console.log(user);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
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
