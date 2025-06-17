import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

const router = Router();

router.patch(
  '/api/todo/boards/:boardUuid',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { boardUuid } = req.params;
    let { title, color, isPinned, isFavorite } = req.body;

    const dataToUpdate = {};
    try {
      if (
        typeof title === 'string' &&
        title.trim() &&
        title.trim().length <= 64
      ) {
        dataToUpdate.title = title.trim();
      }
      if (typeof color === 'string' && color.trim()) {
        const cleaned = color.trim().replace(/^#/, '');
        if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleaned)) {
          return res.status(400).json({ error: 'Неверный формат цвета' });
        }
        dataToUpdate.color = cleaned;
      }
      if (typeof isPinned === 'boolean') {
        dataToUpdate.isPinned = isPinned;
      }
      if (typeof isFavorite === 'boolean') {
        dataToUpdate.isFavorite = isFavorite;
      }
      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }

      const updatedBoard = await prisma.board.updateMany({
        where: {
          uuid: boardUuid,
          user: { uuid: userUuid },
        },
        data: dataToUpdate,
      });

      if (updatedBoard.count === 0) {
        return res.status(404).json({
          error: 'Доска не найдена или не принадлежит пользователю',
        });
      }

      res.status(200).json({
        message: 'Доска успешно обновлена',
        updated: dataToUpdate,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res
          .status(409)
          .json({ error: 'У вас уже есть доска с таким именем' });
      }
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Доска не найдена или доступ запрещён' });
      }
      console.error('Ошибка обновления доски:', error);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
);

export default {
  path: '/',
  router,
};
