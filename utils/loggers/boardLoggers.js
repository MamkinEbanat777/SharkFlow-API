/**
 * @module loggers/board
 * @description Логгеры для работы с досками.
 */
import { logInfo, logWarn, logError, logSuspicious } from './baseLogger.js';

const validateParams = (userUuid, ip) => {
  if (!userUuid) throw new Error('userUuid is required');
  if (!ip) throw new Error('ip is required');
};

/**
 * Логирование создания доски
 * @param {string} title - Название доски
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logBoardCreation('My Project Board', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logBoardCreation = (title, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo('Board', 'created', `"${title}" by user ${userUuid} from IP: ${ip}`);
};

/**
 * Логирование удаления доски
 * @param {string} title - Название доски
 * @param {number} taskCount - Количество задач в доске
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logBoardDeletion('My Project Board', 15, '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logBoardDeletion = (title, taskCount, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  if (typeof taskCount !== 'number') throw new Error('taskCount must be a number');
  validateParams(userUuid, ip);
  logInfo(
    'Board',
    'deleted',
    `"${title}" (${taskCount} tasks) by user ${userUuid} from IP: ${ip}`,
  );
};

/**
 * Логирование обновления доски
 * @param {string} title - Название доски
 * @param {Object} changes - Объект с изменениями
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logBoardUpdate('My Project Board', {color: 'blue', title: 'New Title'}, '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logBoardUpdate = (title, changes, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo(
    'Board',
    'updated',
    `"${title}" by user ${userUuid} from IP: ${ip}, changes: ${JSON.stringify(changes)}`,
  );
};

/**
 * Логирование получения досок (только в development)
 * @param {number} boardsCount - Количество полученных досок
 * @param {number} totalBoards - Общее количество досок
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logBoardFetch(5, 10, '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logBoardFetch = (boardsCount, totalBoards, userUuid, ip) => {
  if (typeof boardsCount !== 'number') throw new Error('boardsCount must be a number');
  if (typeof totalBoards !== 'number') throw new Error('totalBoards must be a number');
  validateParams(userUuid, ip);
  
  if (process.env.NODE_ENV === 'development') {
    logInfo(
      'Board',
      'fetched',
      `${boardsCount}/${totalBoards} by user ${userUuid} from IP: ${ip}`,
    );
  }
};

/**
 * Логирование ошибки при работе с досками
 * @param {string} action - Действие, которое вызвало ошибку
 * @param {Error} error - Объект ошибки
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logBoardError('creation', new Error('Database connection failed'), '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logBoardError = (action, error, userUuid, ip) => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logError('Board', action, `for user ${userUuid} from IP: ${ip}`, error);
};

/**
 * Логирование подозрительной активности при работе с досками
 * @param {string} action - Действие, которое вызвало подозрение
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} [details=''] - Дополнительные детали
 * @example
 * logSuspiciousActivity('mass_deletion', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', 'Deleted 50 boards in 1 minute');
 */
export const logSuspiciousActivity = (action, userUuid, ip, details = '') => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logSuspicious('Board', action, userUuid, ip, details);
};
