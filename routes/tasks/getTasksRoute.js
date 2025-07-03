import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

import { logTaskFetch } from '../../utils/loggers/taskLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';

const router = Router();

router.get(
  '/api/boards/:boardUuid/tasks',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const boardUuid = req.params.boardUuid;
    const ipAddress = getClientIP(req);

    try {
      const [tasks, totalTasks] = await Promise.all([
        prisma.task.findMany({
          where: {
            isDeleted: false,
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
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при загрузке задач',
        status: 500,
        message: 'Произошла внутренняя ошибка сервера при загрузке задач',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
