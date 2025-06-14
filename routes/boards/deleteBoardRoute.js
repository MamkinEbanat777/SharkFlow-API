import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prismaConfig/prismaClient.js';

const router = Router();

router.delete('/todo/deleteBoard/:boardUuid', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Отсутствует или неверный токен' });
    }
    const token = authHeader.split(' ')[1];
    const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const userUuid = userData.userUuid;
    if (!userUuid) {
      return res
        .status(401)
        .json({ error: 'Токен не содержит uuid пользователя' });
    }

    // console.log('бади удаляшки',req.body);
    // console.log('парамы удаляшки',req.params);

    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { boardUuid } = req.params;

    const deleted = await prisma.board.deleteMany({
      where: {
        uuid: boardUuid,
        userId: user.id,
      },
    });

    if (deleted.count === 0) {
      return res
        .status(404)
        .json({ error: 'Доска не найдена или доступ запрещён' });
    }

    res.status(200).json({
      message: 'Доска успешно удалена',
    });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
    console.error('Ошибка при удалении доски:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
