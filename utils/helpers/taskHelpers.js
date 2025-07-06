import prisma from '../prismaConfig/prismaClient.js';
import { Priority, Status } from '@prisma/client';

/**
 * Поиск доски по UUID для пользователя (с проверкой владельца)
 * @param {string} boardUuid - UUID доски
 * @param {string} userUuid - UUID пользователя-владельца
 * @param {Object} select - Объект для выбора полей (опционально)
 * @returns {Promise<Object|null>} Доска или null если не найдена
 * @example
 * const board = await findBoardByUuidForUser('board-uuid', 'user-uuid');
 */
export const findBoardByUuidForUser = async (boardUuid, userUuid, select = {}) => {
  return await prisma.board.findFirst({
    where: {
      uuid: boardUuid,
      user: { uuid: userUuid, isDeleted: false },
      isDeleted: false,
    },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

/**
 * Поиск задачи по UUID в рамках доски
 * @param {string} taskUuid - UUID задачи
 * @param {number} boardId - ID доски
 * @param {Object} select - Объект для выбора полей (опционально)
 * @returns {Promise<Object|null>} Задача или null если не найдена
 * @example
 * const task = await findTaskByUuid('task-uuid', 123);
 */
export const findTaskByUuid = async (taskUuid, boardId, select = {}) => {
  return await prisma.task.findFirst({
    where: {
      uuid: taskUuid,
      boardId,
      isDeleted: false,
    },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

/**
 * Поиск задачи с проверкой доступа к доске
 * @param {string} taskUuid - UUID задачи
 * @param {string} boardUuid - UUID доски
 * @param {string} userUuid - UUID пользователя-владельца
 * @param {Object} select - Объект для выбора полей (опционально)
 * @returns {Promise<Object|null>} Задача или null если не найдена
 * @example
 * const task = await findTaskWithBoardAccess('task-uuid', 'board-uuid', 'user-uuid');
 */
export const findTaskWithBoardAccess = async (taskUuid, boardUuid, userUuid, select = {}) => {
  return await prisma.task.findFirst({
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
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

/**
 * Получение количества задач пользователя
 * @param {string} userUuid - UUID пользователя
 * @returns {Promise<number>} Количество задач
 * @example
 * const taskCount = await getUserTaskCount('user-uuid');
 */
export const getUserTaskCount = async (userUuid) => {
  return await prisma.task.count({
    where: { board: { user: { uuid: userUuid } } },
  });
};

/**
 * Получение всех задач для доски пользователя
 * @param {string} boardUuid - UUID доски
 * @param {string} userUuid - UUID пользователя-владельца
 * @returns {Promise<Array>} Массив задач
 * @example
 * const tasks = await getTasksForBoard('board-uuid', 'user-uuid');
 */
export const getTasksForBoard = async (boardUuid, userUuid) => {
  return await prisma.task.findMany({
    where: {
      isDeleted: false,
      board: {
        uuid: boardUuid,
        isDeleted: false,
        user: { uuid: userUuid, isDeleted: false },
      },
    },
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      uuid: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      description: true,
      dueDate: true,
      priority: true,
      status: true,
    },
  });
};

/**
 * Мягкое удаление задачи
 * @param {number} taskId - ID задачи
 * @returns {Promise<Object>} Обновленная задача
 * @example
 * const deletedTask = await softDeleteTask(123);
 */
export const softDeleteTask = async (taskId) => {
  return await prisma.task.update({
    where: { id: taskId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

/**
 * Валидация данных задачи
 * @param {Object} data - Данные для валидации
 * @param {string} [data.title] - Название задачи
 * @param {string|Date|null} [data.dueDate] - Дедлайн задачи
 * @param {string} [data.description] - Описание задачи
 * @param {string|null} [data.priority] - Приоритет задачи
 * @param {string|null} [data.status] - Статус задачи
 * @returns {Object} Результат валидации {isValid: boolean, errors: Array, data: Object}
 * @example
 * const validation = validateTaskData({ title: 'Task', priority: 'HIGH' });
 * if (!validation.isValid) {
 *   console.log(validation.errors);
 * }
 */
export const validateTaskData = (data) => {
  const errors = [];
  const validatedData = {};

  // Валидация title
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push('Название должно быть строкой');
    } else {
      const trimmedTitle = data.title.trim();
      if (trimmedTitle.length === 0 || trimmedTitle.length > 64) {
        errors.push('Название должно быть не более 64 символов');
      } else {
        validatedData.title = trimmedTitle;
      }
    }
  }

  // Валидация dueDate
  if (data.dueDate !== undefined) {
    if (data.dueDate === null) {
      validatedData.dueDate = null;
    } else {
      const d = new Date(data.dueDate);
      if (isNaN(d.valueOf())) {
        errors.push('Дедлайн должен быть валидной датой');
      } else {
        validatedData.dueDate = d;
      }
    }
  }

  // Валидация description
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Описание должно быть строкой');
    } else {
      validatedData.description = data.description.trim();
    }
  }

  // Валидация priority
  if (data.priority !== undefined) {
    if (data.priority === null) {
      validatedData.priority = null;
    } else if (typeof data.priority !== 'string' || !Object.values(Priority).includes(data.priority)) {
      errors.push(`Приоритет должен быть одним из: ${Object.values(Priority).join(', ')}`);
    } else {
      validatedData.priority = data.priority;
    }
  }

  // Валидация status
  if (data.status !== undefined) {
    if (data.status === null) {
      validatedData.status = null;
    } else if (!Object.values(Status).includes(data.status)) {
      errors.push(`Статус должен быть одним из: ${Object.values(Status).join(', ')}`);
    } else {
      validatedData.status = data.status;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData,
  };
}; 