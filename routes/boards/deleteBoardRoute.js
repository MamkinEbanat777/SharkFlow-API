import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

const router = Router();

router.delete(
  '/api/todo/boards/:boardUuid',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { boardUuid } = req.params;

    try {
      const result = await prisma.board.deleteMany({
        where: {
          uuid: boardUuid,
          user: { uuid: userUuid },
        },
      });

      if (result.count === 0) {
        return res
          .status(404)
          .json({ error: 'Доска не найдена или доступ запрещён' });
      }

      return res.status(200).json({ message: 'Доска успешно удалена' });
    } catch (error) {
      console.error('Ошибка при удалении доски:', error);

      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Доска не найдена или доступ запрещён' });
      }

      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  },
);

export default {
  path: '/',
  router,
};
