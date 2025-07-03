import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { isValidUUID } from '../../utils/validators/boardValidators.js';
import { logBoardDeletion } from '../../utils/loggers/boardLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';

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

    try {
      const boardToDelete = await prisma.board.findFirst({
        where: {
          uuid: boardUuid,
          user: { uuid: userUuid },
          isDeleted: false,
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

      await prisma.$transaction([
        prisma.board.update({
          where: { id: boardToDelete.id },
          data: { isDeleted: true, deletedAt: new Date() },
        }),
        prisma.task.updateMany({
          where: { boardId: boardToDelete.id, isDeleted: false },
          data: { isDeleted: true, deletedAt: new Date() },
        }),
      ]);

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
