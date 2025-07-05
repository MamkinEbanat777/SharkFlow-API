import { Router } from 'express';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { validateTaskUuids } from '../../middlewares/http/taskMiddleware.js';
import { getClientIP } from '../../utils/helpers/authHelpers.js';
import { logTaskDeletion } from '../../utils/loggers/taskLoggers.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';
import { findTaskWithBoardAccess, softDeleteTask } from '../../utils/helpers/taskHelpers.js';

const router = Router();

router.delete(
  '/api/boards/:boardUuid/tasks/:taskUuid',
  authenticateMiddleware,
  validateTaskUuids,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { boardUuid, taskUuid } = req.params;
    const ipAddress = getClientIP(req);

    try {
      const taskToDelete = await findTaskWithBoardAccess(taskUuid, boardUuid, userUuid, {
        id: true,
        title: true,
      });
      
      if (!taskToDelete) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена или доступ запрещён' });
      }

      await softDeleteTask(taskToDelete.id);

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
