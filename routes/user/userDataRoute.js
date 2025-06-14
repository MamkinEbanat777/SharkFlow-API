import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prismaConfig/prismaClient.js';

const router = Router();

router.post('/user', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res
        .status(401)
        .json({ error: 'Отсутствует заголовок авторизации' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Токен не передан' });
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const userUuid = payload.userUuid;
    if (!userUuid) {
      return res
        .status(400)
        .json({ error: 'UUID пользователя не найден в токене' });
    }

    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
      include: {
        boards: {
          include: {
            tasks: true,
          },
        },
        // tasks: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный токен' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен просрочен' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
