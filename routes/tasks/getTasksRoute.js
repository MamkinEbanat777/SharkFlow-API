import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

import { logTaskFetch } from '../../utils/loggers/taskLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';
import { isValidUUID } from '../../utils/validators/boardValidators.js';

const router = Router();

router.get(
  '/api/boards/:boardUuid/tasks',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const boardUuid = req.params.boardUuid;
    const ipAddress = getClientIP(req);

    if (!isValidUUID(boardUuid)) {
      return res
        .status(400)
        .json({ error: 'Неверный формат идентификатора доски' });
    }

    try {
      const tasks = await prisma.task.findMany({
        where: {
          isDeleted: false,
          board: {
            uuid: boardUuid,
            isDeleted: false,
            user: { uuid: userUuid, isDeleted: false },
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
      });

      logTaskFetch(tasks.length, tasks.length, userUuid, ipAddress);

      res.json({ tasks });
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
