import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import {
  validateTaskTitle,
  isValidUUID,
} from '../../utils/validators/taskValidators.js';
import {
  checkTaskCreationRateLimit,
  incrementTaskCreationAttempts,
} from '../../utils/rateLimiters/taskRateLimiters';
import { logTaskCreation } from '../../utils/loggers/taskLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import { Priority, Status } from '@prisma/client';

const router = Router();

router.post(
  '/api/boards/:boardUuid/tasks',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const boardUuid = req.params.boardUuid;
    const ipAddress = getClientIP(req);

    const rateLimitCheck = checkTaskCreationRateLimit(userUuid);
    if (rateLimitCheck.blocked) {
      return res.status(429).json({
        error: `Слишком много попыток создания задач. Попробуйте через ${rateLimitCheck.timeLeft} секунд`,
      });
    }

    if (!isValidUUID(boardUuid)) {
      return res.status(400).json({ error: 'Некорректный UUID доски' });
    }

    const board = await prisma.board.findFirst({
      where: {
        uuid: boardUuid,
        user: { uuid: userUuid },
      },
      select: { id: true },
    });

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

    if (!rawTitle || typeof rawTitle !== 'string') {
      return res.status(400).json({ error: 'Название задачи обязательно' });
    }

    const titleValidation = validateTaskTitle(rawTitle);
    if (!titleValidation.isValid) {
      return res.status(400).json({ error: titleValidation.error });
    }
    const title = titleValidation.value;

    const dueDate =
      rawDueDate && !isNaN(Date.parse(rawDueDate))
        ? new Date(rawDueDate)
        : rawDueDate === null
        ? null
        : (() => {
            return res
              .status(400)
              .json({ error: 'Некорректная дата дедлайна' });
          })();

    const priority =
      rawPriority && Object.values(Priority).includes(rawPriority)
        ? rawPriority
        : rawPriority === null
        ? null
        : (() => {
            return res
              .status(400)
              .json({ error: 'Недопустимый приоритет задачи' });
          })();

    const status =
      rawStatus && Object.values(Status).includes(rawStatus)
        ? rawStatus
        : rawStatus === null
        ? null
        : (() => {
            return res
              .status(400)
              .json({ error: 'Недопустимый статус задачи' });
          })();

    try {
      const taskCount = await prisma.task.count({
        where: { board: { user: { uuid: userUuid } } },
      });

      const MAX_TASKS_PER_USER = 500;
      if (taskCount >= MAX_TASKS_PER_USER) {
        return res.status(400).json({
          error: `Достигнут лимит задач (${MAX_TASKS_PER_USER}). Удалите некоторые задачи для создания новых.`,
        });
      }

      const newTask = await prisma.task.create({
        data: {
          title,
          description: rawdescription ?? '',
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

      incrementTaskCreationAttempts(userUuid);

      logTaskCreation(title, userUuid, ipAddress);

      return res.status(201).json({
        message: 'Задача успешно создана',
        task: newTask,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      if (error.code === 'P2002') {
        return res
          .status(409)
          .json({ error: 'У вас уже есть задача с таким названием' });
      }

      console.error('Ошибка при создании задачи:', error);
      return res.status(500).json({
        error: 'Произошла внутренняя ошибка сервера. Попробуйте позже',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
