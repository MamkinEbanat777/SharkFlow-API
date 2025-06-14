import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prismaConfig/prismaClient.js';

const router = Router();

router.post('/todo/createBoard', async (req, res) => {
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

    // console.log(req.body);

    let { title, color } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Название доски обязательно' });
    }

    if (!color || typeof color !== 'string') {
      return res.status(400).json({ error: 'Цвет доски обязателен' });
    }
    color = color.startsWith('#') ? color.slice(1) : color;
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const newBoard = await prisma.board.create({
      data: {
        title,
        color,
        userId: user.id,
      },
    });

    res.status(201).json({
      message: 'Доска успешно создана',
      uuid: newBoard.uuid,
      title: newBoard.title,
      color: newBoard.color,
      createdAt: newBoard.createdAt,
      updatedAt: newBoard.updatedAt,
    });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
    console.error('Ошибка при создании доски:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
