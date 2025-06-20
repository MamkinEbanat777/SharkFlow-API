import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { isValidUUID } from '../../utils/validators/boardValidators.js';
import {
  checkBoardDeletionRateLimit,
  incrementBoardDeletionAttempts,
} from '../../utils/rateLimiters/boardRateLimiters.js';
import { logBoardDeletion } from '../../utils/loggers/boardLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';

const router = Router();

router.delete(
  '/api/boards/:boardUuid',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { boardUuid } = req.params;
    const ipAddress = getClientIP(req);

    if (!isValidUUID(boardUuid)) {
      return res
        .status(400)
        .json({ error: 'Неверный формат идентификатора доски' });
    }

    const rateLimitCheck = checkBoardDeletionRateLimit(userUuid);
    if (rateLimitCheck.blocked) {
      return res.status(429).json({
        error: `Слишком много попыток удаления досок. Попробуйте через ${rateLimitCheck.timeLeft} секунд`,
      });
    }

    try {
      const boardToDelete = await prisma.board.findFirst({
        where: {
          uuid: boardUuid,
          user: { uuid: userUuid },
        },
        select: {
          id: true,
          uuid: true,
          title: true,
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      if (!boardToDelete) {
        return res
          .status(404)
          .json({ error: 'Доска не найдена или доступ запрещён' });
      }

      const taskCount = boardToDelete._count.tasks;

      await prisma.board.delete({
        where: { id: boardToDelete.id },
      });

      incrementBoardDeletionAttempts(userUuid);

      logBoardDeletion(boardToDelete.title, taskCount, userUuid, ipAddress);

      return res.status(200).json({
        deletedBoard: {
          title: boardToDelete.title,
          tasksRemoved: taskCount,
        },
      });
    } catch (error) {
      console.error('Ошибка при удалении доски:', error);

      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Доска не найдена или доступ запрещён' });
      }

      return res
        .status(500)
        .json({ error: 'Произошла внутренняя ошибка сервера' });
    }
  },
);

export default {
  path: '/',
  router,
};
