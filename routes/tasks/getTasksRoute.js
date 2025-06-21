import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

import {
  checkTaskFetchRateLimit,
  incrementTaskFetchAttempts,
} from '../../utils/rateLimiters/taskRateLimiters.js';

import { logTaskFetch } from '../../utils/loggers/taskLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';

const router = Router();

router.get(
  '/api/boards/:boardUuid/tasks',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const boardUuid = req.params.boardUuid;
    const ipAddress = getClientIP(req);

    const rateLimitCheck = checkTaskFetchRateLimit(userUuid);
    if (rateLimitCheck.blocked) {
      return res.status(429).json({
        error: `Слишком много запросов. Попробуйте через ${rateLimitCheck.timeLeft} секунд`,
      });
    }

    try {
      const [tasks, totalTasks] = await Promise.all([
        prisma.task.findMany({
          where: {
            board: {
              uuid: boardUuid,
              user: { uuid: userUuid },
            },
          },
          orderBy: [{ updatedAt: 'desc' }],
          select: {
            uuid: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            description: true,
            dueDate: true,
            priority: true,
            status: true,
          },
        }),
      ]);

      incrementTaskFetchAttempts(userUuid);

      logTaskFetch(tasks.length, totalTasks, userUuid, ipAddress);

      res.json({
        tasks: tasks.map((task) => ({
          uuid: task.uuid,
          title: task.title,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
        })),
      });
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
      res.status(500).json({ error: 'Произошла внутренняя ошибка сервера' });
    }
  },
);

export default {
  path: '/',
  router,
};
