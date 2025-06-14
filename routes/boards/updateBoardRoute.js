import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prismaConfig/prismaClient.js';

const router = Router();

router.patch('/todo/updateBoard/:boardUuid', async (req, res) => {
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

    const { boardUuid } = req.params;
    let { title, color, isPinned, isFavorite } = req.body;
    const dataToUpdate = {};

    if (typeof title === 'string' && title.trim() !== '') {
      dataToUpdate.title = title.trim();
    }
    if (typeof color === 'string' && color.trim() !== '') {
      dataToUpdate.color = color.trim().startsWith('#')
        ? color.trim().slice(1)
        : color.trim();
    }
    if (typeof isPinned === 'boolean') {
      dataToUpdate.isPinned = isPinned;
    }

    if (typeof isFavorite === 'boolean') {
      dataToUpdate.isFavorite = isFavorite;
    }

    // console.log(dataToUpdate);

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    // console.log('Параметры новой доски:', req.body);

    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const updatedBoard = await prisma.board.updateMany({
      where: {
        uuid: boardUuid,
        userId: user.id,
      },
      data: dataToUpdate,
    });

    if (updatedBoard.count === 0) {
      return res
        .status(404)
        .json({ error: 'Доска не найдена или не принадлежит пользователю' });
    }
    res.status(200).json({
      message: 'Доска успешно обновлена',
      data: { title, color, isPinned, isFavorite },
    });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
    console.error('Ошибка при обновлении доски:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
