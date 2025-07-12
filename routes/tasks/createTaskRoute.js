import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { validateTaskUuids } from '../../middlewares/http/taskMiddleware.js';
import { validateTaskTitle } from '../../utils/validators/taskValidators.js';
import { logTaskCreation } from '../../utils/loggers/taskLoggers.js';
import { getClientIP } from '../../utils/helpers/authHelpers.js';
import { Priority, Status } from '@prisma/client';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';
import { findBoardByUuidForUser, getUserTaskCount, validateTaskData } from '../../utils/helpers/taskHelpers.js';

const router = Router();

router.post(
  '/api/boards/:boardUuid/tasks',
  authenticateMiddleware,
  validateTaskUuids,
  async (req, res) => {
    const userUuid = req.userUuid;
    const boardUuid = req.params.boardUuid;
    const ipAddress = getClientIP(req);

    const board = await findBoardByUuidForUser(boardUuid, userUuid, { id: true });

    if (!board) {
      return res.status(403).json({
        error: 'Доска не найдена или вы не являетесь её владельцем',
      });
    }

    const rawTitle = req.body.title;
    const rawDueDate = req.body.dueDate?.trim() || null;
    const rawdescription = req.body.description;
    const rawPriority = req.body.priority?.trim() || null;
    const rawStatus = req.body.status?.trim() || null;

    const validation = validateTaskData({
      title: rawTitle,
      dueDate: rawDueDate,
      description: rawdescription,
      priority: rawPriority,
      status: rawStatus,
    });

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors[0] });
    }

    const { title, dueDate, description, priority, status } = validation.data;

    try {
      const taskCount = await getUserTaskCount(userUuid);

      const MAX_TASKS_PER_USER = 500;
      if (taskCount >= MAX_TASKS_PER_USER) {
        return res.status(400).json({
          error: `Достигнут лимит задач (${MAX_TASKS_PER_USER}). Удалите некоторые задачи для создания новых.`,
        });
      }

      const newTask = await prisma.task.create({
        data: {
          title,
          description: description ?? '',
          dueDate,
          priority,
          status,
          board: { connect: { uuid: boardUuid } },
        },
        select: {
          uuid: true,
          title: true,
          description: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
          priority: true,
          status: true,
        },
      });

      const updatedTaskCount = await prisma.task.count({
        where: { board: { uuid: boardUuid } },
      });

      logTaskCreation(title, userUuid, ipAddress);

      return res.status(201).json({
        message: 'Задача успешно создана',
        task: newTask,
        taskCount: updatedTaskCount,
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при создании задачи',
        mappings: {
          P2025: { status: 404, message: 'Пользователь не найден' },
          P2002: {
            status: 409,
            message: 'У вас уже есть задача с таким названием',
          },
        },
        status: 500,
        message: 'Произошла внутренняя ошибка сервера. Попробуйте позже',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
