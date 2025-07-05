import prisma from '../prismaConfig/prismaClient.js';
import { Priority, Status } from '@prisma/client';

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

export const getUserTaskCount = async (userUuid) => {
  return await prisma.task.count({
    where: { board: { user: { uuid: userUuid } } },
  });
};

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

export const softDeleteTask = async (taskId) => {
  return await prisma.task.update({
    where: { id: taskId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

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