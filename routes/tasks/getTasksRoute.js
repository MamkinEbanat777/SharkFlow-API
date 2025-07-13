import { Router } from 'express';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { validateTaskUuids } from '../../middlewares/http/taskMiddleware.js';
import { logTaskFetch } from '../../utils/loggers/taskLoggers.js';
import { getClientIP } from '../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';
import { getTasksForBoard } from '../../utils/helpers/taskHelpers.js';

const router = Router();

router.get(
  '/boards/:boardUuid/tasks',
  authenticateMiddleware,
  validateTaskUuids,
  async (req, res) => {
    const userUuid = req.userUuid;
    const boardUuid = req.params.boardUuid;
    const ipAddress = getClientIP(req);

    try {
      const tasks = await getTasksForBoard(boardUuid, userUuid);

      logTaskFetch(tasks.length, tasks.length, userUuid, ipAddress);

      return res.json({ tasks });
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
