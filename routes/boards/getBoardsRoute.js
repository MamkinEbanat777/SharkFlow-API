import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/todo/getBoards', async (req, res) => {
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

    const userWithBoards = await prisma.user.findUnique({
      where: { uuid: userUuid },
      include: {
        boards: {
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!userWithBoards) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    // console.log(userWithBoards);
    res.json({
      boards: userWithBoards.boards.map(({ id, ...rest }) => rest),
    });
  } catch (error) {
    console.error('Ошибка при загрузке досок:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});
export default {
  path: '/',
  router,
};
