import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { validateTaskUuids } from '../../middlewares/http/taskMiddleware.js';
import { getClientIP } from '../../utils/helpers/authHelpers.js';
import { logTaskUpdate } from '../../utils/loggers/taskLoggers.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';
import {
  findBoardByUuidForUser,
  findTaskByUuid,
  validateTaskData,
} from '../../utils/helpers/taskHelpers.js';

const router = Router();

router.patch(
  '/boards/:boardUuid/tasks/:taskUuid',
  authenticateMiddleware,
  validateTaskUuids,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { boardUuid, taskUuid } = req.params;
    const ipAddress = getClientIP(req);

    const { title, dueDate, description, priority, status } = req.body;

    try {
      const validation = validateTaskData({
        title,
        dueDate,
        description,
        priority,
        status,
      });

      if (!validation.isValid) {
        return res.status(400).json({ error: validation.errors[0] });
      }

      const dataToUpdate = validation.data;

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }

      const board = await findBoardByUuidForUser(boardUuid, userUuid, {
        id: true,
      });

      if (!board) {
        return res
          .status(404)
          .json({ error: 'Доска не найдена или доступ запрещён' });
      }

      const select = { uuid: true };
      for (const key of Object.keys(dataToUpdate)) {
        select[key] = true;
      }

      const task = await findTaskByUuid(taskUuid, board.id);

      if (!task) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена или доступ запрещён' });
      }

      const updatedTask = await prisma.task.update({
        where: { uuid: taskUuid },
        data: dataToUpdate,
        select,
      });

      logTaskUpdate(taskUuid, dataToUpdate, userUuid, ipAddress);

      return res.status(200).json({
        message: 'Задача успешно обновлена',
        updated: updatedTask,
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка обновления задачи',
        mappings: {
          P2002: {
            status: 409,
            message: 'У вас уже есть задача с таким названием',
          },
          P2025: {
            status: 404,
            message: 'Задача не найдена или доступ запрещён',
          },
        },
        status: 500,
        message: 'Произошла внутренняя ошибка сервера при обновлении задачи',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
