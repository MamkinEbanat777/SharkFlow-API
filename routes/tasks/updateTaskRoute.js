import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { isValidUUID } from '../../utils/validators/boardValidators.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import {
  checkTaskUpdateRateLimit,
  incrementTaskUpdateAttempts,
} from '../../utils/rateLimiters/taskRateLimiters.js';
import { logTaskUpdate } from '../../utils/loggers/taskLoggers.js';
import { Priority, Status } from '@prisma/client';

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

    const rateLimitCheck = checkTaskUpdateRateLimit(userUuid);
    if (rateLimitCheck.blocked) {
      return res.status(429).json({
        error: `Слишком много попыток обновления задач. Попробуйте через ${rateLimitCheck.timeLeft} секунд`,
      });
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
        if (title.length === 0 || title.length > 64) {
          return res.status(400).json({
            error: 'Название должно быть не более 64 символов',
          });
        }
        dataToUpdate.title = title.trim();
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
        if (priority !== null && !Object.values(Priority).includes(priority)) {
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

      const result = await prisma.task.updateMany({
        where: {
          uuid: taskUuid,
          board: {
            uuid: boardUuid,
            user: { uuid: userUuid },
          },
        },
        data: dataToUpdate,
      });

      if (result.count === 0) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена или доступ запрещён' });
      }

      incrementTaskUpdateAttempts(userUuid);
      logTaskUpdate(taskUuid, dataToUpdate, userUuid, ipAddress);

      res.status(200).json({
        message: 'Задача успешно обновлена',
        updated: {
          uuid: taskUuid,
          ...dataToUpdate,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res
          .status(409)
          .json({ error: 'У вас уже есть задача с таким названием' });
      }
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Задача не найдена или доступ запрещён' });
      }
      console.error('Ошибка обновления задачи:', error);
      return res
        .status(500)
        .json({ error: 'Произошла внутренняя ошибка сервера' });
    }
  },
);

export default {
  path: '/',
  router,
};
