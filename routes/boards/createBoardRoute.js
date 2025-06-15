import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

const router = Router();
router.post('/todo/createBoard', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const color =
    typeof req.body.color === 'string'
      ? req.body.color.trim().replace(/^#/, '')
      : '';

  if (!title)
    return res.status(400).json({ error: 'Название доски обязательно' });
  if (!color) return res.status(400).json({ error: 'Цвет доски обязателен' });

  try {
    const newBoard = await prisma.board.create({
      data: {
        title,
        color,
        user: { connect: { uuid: userUuid } },
      },
    });
    return res.status(201).json({
      uuid: newBoard.uuid,
      title: newBoard.title,
      color: newBoard.color,
      createdAt: newBoard.createdAt,
      updatedAt: newBoard.updatedAt,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    if (err.code === 'P2002') {
      return res
        .status(409)
        .json({ error: 'У вас уже есть доска с таким названием' });
    }

    console.error(err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
