import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

const router = Router();

router.get('/api/todo/boards', authenticateMiddleware, async (req, res) => {
  try {
    const userUuid = req.userUuid;
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
    res.json({
      boards: userWithBoards.boards.map(
        ({
          uuid,
          title,
          color,
          createdAt,
          updatedAt,
          isPinned,
          isFavorite,
          tasks,
        }) => ({
          uuid,
          title,
          color,
          createdAt,
          updatedAt,
          isPinned,
          isFavorite,
          tasks,
        }),
      ),
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
