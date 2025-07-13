/**
 * @module helpers/task
 * @description Вспомогательные функции для работы с задачами.
 */
import prisma from '../prismaConfig/prismaClient.js';
import { isValidUUID } from '../validators/taskValidators.js';
import { validateTaskStatus, validateTaskPriority } from '../validators/enumValidators.js';

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
  if (!isValidUUID(boardUuid)) {
    throw new Error('Invalid board UUID');
  }
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }
  
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
  if (!isValidUUID(taskUuid)) {
    throw new Error('Invalid task UUID');
  }
  
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
  if (!isValidUUID(taskUuid)) {
    throw new Error('Invalid task UUID');
  }
  if (!isValidUUID(boardUuid)) {
    throw new Error('Invalid board UUID');
  }
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }
  
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
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }
  
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
  if (!isValidUUID(boardUuid)) {
    throw new Error('Invalid board UUID');
  }
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }
  
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
 *   logError('TaskValidation', 'validationFailed', validation.errors);
 * }
 */
export const validateTaskData = (data) => {
  const errors = [];
  const validatedData = {};

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

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Описание должно быть строкой');
    } else {
      validatedData.description = data.description.trim();
    }
  }

  if (data.priority !== undefined) {
    const priorityValidation = validateTaskPriority(data.priority);
    if (!priorityValidation.isValid) {
      errors.push(priorityValidation.error);
    } else {
      validatedData.priority = priorityValidation.value;
    }
  }

  if (data.status !== undefined) {
    const statusValidation = validateTaskStatus(data.status);
    if (!statusValidation.isValid) {
      errors.push(statusValidation.error);
    } else {
      validatedData.status = statusValidation.value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData,
  };
}; 