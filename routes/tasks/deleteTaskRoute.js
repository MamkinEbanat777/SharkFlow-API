import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { isValidUUID } from '../../utils/validators/boardValidators.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import {
  checkTaskDeletionRateLimit,
  incrementTaskDeletionAttempts,
} from '../../utils/rateLimiters/taskRateLimiters.js';
import { logTaskDeletion } from '../../utils/loggers/taskLoggers.js';

const router = Router();

router.delete(
  '/api/boards/:boardUuid/tasks/:taskUuid',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { boardUuid, taskUuid } = req.params;
    const ipAddress = getClientIP(req);

    if (!isValidUUID(boardUuid)) {
      return res
        .status(400)
        .json({ error: 'Неверный формат идентификатора доски' });
    }

    if (!isValidUUID(taskUuid)) {
      return res
        .status(400)
        .json({ error: 'Неверный формат идентификатора задачи' });
    }

    const rateLimitCheck = checkTaskDeletionRateLimit(userUuid);
    if (rateLimitCheck.blocked) {
      return res.status(429).json({
        error: `Слишком много попыток удаления задач. Попробуйте через ${rateLimitCheck.timeLeft} секунд`,
      });
    }

    try {
      const taskToDelete = await prisma.task.findFirst({
        where: {
          uuid: taskUuid,
          isDeleted: false,
          board: {
            uuid: boardUuid,
            user: {
              uuid: userUuid,
            },
          },
        },
        select: { id: true, title: true },
      });
      if (!taskToDelete) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена или доступ запрещён' });
      }

      incrementTaskDeletionAttempts(userUuid);

      await prisma.task.update({
        where: { id: taskToDelete.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      logTaskDeletion(taskToDelete.title, userUuid, ipAddress);

      return res
        .status(200)
        .json({ deletedTask: { title: taskToDelete.title } });
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);

      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Задача не найдена или доступ запрещён' });
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
