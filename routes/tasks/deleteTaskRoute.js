import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { isValidUUID } from '../../utils/validators/boardValidators.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import { logTaskDeletion } from '../../utils/loggers/taskLoggers.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';

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

    try {
      const taskToDelete = await prisma.task.findFirst({
        where: {
          uuid: taskUuid,
          isDeleted: false,
          board: {
            uuid: boardUuid,
            isDeleted: false,
            user: {
              uuid: userUuid,
              isDeleted: false,
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
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при удалении задачи',
        mappings: {
          P2025: {
            status: 404,
            message: 'Задача не найдена или доступ запрещён',
          },
        },
        status: 500,
        message: 'Произошла внутренняя ошибка сервера',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
