import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

const router = Router();

router.patch(
  '/todo/updateBoard/:boardUuid',
  authenticateMiddleware,
  async (req, res) => {
    try {
      const userUuid = req.userUuid;
      const { boardUuid } = req.params;
      let { title, color, isPinned, isFavorite } = req.body;

      const dataToUpdate = {};

      if (typeof title === 'string' && title.trim()) {
        dataToUpdate.title = title.trim();
      }
      if (typeof color === 'string' && color.trim()) {
        dataToUpdate.color = color.trim().replace(/^#/, '');
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

      if (title.length > 64)
        return res.status(400).json({ error: 'Название слишком длинное' });

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
        updated: { title, color, isPinned, isFavorite },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res
          .status(409)
          .json({ error: 'У вас уже есть доска с таким именем' });
      }
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
);

export default {
  path: '/',
  router,
};
