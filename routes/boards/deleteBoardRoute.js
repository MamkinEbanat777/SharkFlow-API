import { Router } from 'express';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { validateBoardUuid } from '#middlewares/http/boardMiddleware.js';
import { logBoardDeletion } from '#utils/loggers/boardLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import {
  findBoardByUuid,
  softDeleteBoardWithTasks,
} from '#utils/helpers/boardHelpers.js';

const router = Router();

router.delete(
  '/boards/:boardUuid',
  authenticateMiddleware,
  validateBoardUuid,
  async (req, res) => {
    const userUuid = req.userUuid;
    const boardUuid = req.params.boardUuid;
    const { ipAddress } = getRequestInfo(req);

    try {
      const boardToDelete = await findBoardByUuid(boardUuid, userUuid, {
        id: true,
        uuid: true,
        title: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      });

      if (!boardToDelete) {
        return res
          .status(404)
          .json({ error: 'Доска не найдена или доступ запрещён' });
      }

      const taskCount = boardToDelete._count.tasks;

      await softDeleteBoardWithTasks(boardToDelete.id);

      logBoardDeletion(boardToDelete.title, taskCount, userUuid, ipAddress);

      return res.status(200).json({
        message: 'Доска успешно удалена',
        deletedBoard: {
          title: boardToDelete.title,
          tasksRemoved: taskCount,
        },
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при удалении доски',
        mappings: {
          P2025: {
            status: 404,
            message: 'Доска не найдена или доступ запрещён',
          },
        },
        status: 500,
        message: 'Произошла внутренняя ошибка сервера при удалении доски',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
