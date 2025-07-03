import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { isValidUUID } from '../../utils/validators/boardValidators.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import { logTaskUpdate } from '../../utils/loggers/taskLoggers.js';
import { Priority, Status } from '@prisma/client';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';

const router = Router();

router.patch(
  '/api/boards/:boardUuid/tasks/:taskUuid',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { boardUuid, taskUuid } = req.params;
    const ipAddress = getClientIP(req);

    if (!isValidUUID(boardUuid)) {
      return res.status(400).json({ error: 'Неверный UUID доски' });
    }
    if (!isValidUUID(taskUuid)) {
      return res.status(400).json({ error: 'Неверный UUID задачи' });
    }

    const { title, dueDate, description, priority, status } = req.body;
    const dataToUpdate = {};

    try {
      if (title !== undefined) {
        if (typeof title !== 'string') {
          return res
            .status(400)
            .json({ error: 'Название должен быть строкой' });
        }
        const trimmedTitle = title.trim();
        if (trimmedTitle.length === 0 || trimmedTitle.length > 64) {
          return res.status(400).json({
            error: 'Название должно быть не более 64 символов',
          });
        }
        dataToUpdate.title = trimmedTitle;
      }

      if (dueDate !== undefined) {
        const d = new Date(dueDate);
        if (isNaN(d.valueOf())) {
          return res
            .status(400)
            .json({ error: 'Дедлайн должен быть валидной датой' });
        }
        dataToUpdate.dueDate = d;
      }

      if (description !== undefined) {
        if (typeof description !== 'string') {
          return res
            .status(400)
            .json({ error: 'Описание должно быть строкой' });
        }
        dataToUpdate.description = description.trim();
      }

      if (priority !== undefined) {
        if (
          priority !== null &&
          (typeof priority !== 'string' ||
            !Object.values(Priority).includes(priority))
        ) {
          return res.status(400).json({
            error: `Приоритет должен быть одним из: ${Object.values(
              Priority,
            ).join(', ')}`,
          });
        }

        dataToUpdate.priority = priority;
      }

      if (status !== undefined) {
        if (status !== null && !Object.values(Status).includes(status)) {
          return res.status(400).json({
            error: `Статус должен быть одним из: ${Object.values(Status).join(
              ', ',
            )}`,
          });
        }
        dataToUpdate.status = status;
      }

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }

      const board = await prisma.board.findFirst({
        where: {
          uuid: boardUuid,
          user: { uuid: userUuid, isDeleted: false },
        },
        select: { id: true },
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

      const task = await prisma.task.findFirst({
        where: {
          uuid: taskUuid,
          boardId: board.id,
          isDeleted: false,
        },
      });

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

      console.log(updatedTask);

      logTaskUpdate(taskUuid, dataToUpdate, userUuid, ipAddress);

      res.status(200).json({
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
