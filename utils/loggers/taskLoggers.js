/**
 * @module loggers/task
 * @description Логгеры для работы с задачами.
 */
import { logInfo, logWarn, logError, logSuspicious } from './baseLogger.js';

const validateParams = (userUuid, ip) => {
  if (!userUuid) throw new Error('userUuid is required');
  if (!ip) throw new Error('ip is required');
};

/**
 * Логирование создания задачи
 * @param {string} title - Название задачи
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logTaskCreation('Implement user authentication', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logTaskCreation = (title, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo('Task', 'created', `"${title}" by user ${userUuid} from IP: ${ip}`);
};

/**
 * Логирование удаления задачи
 * @param {string} title - Название задачи
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logTaskDeletion('Implement user authentication', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logTaskDeletion = (title, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo('Task', 'deleted', `"${title}" by user ${userUuid} from IP: ${ip}`);
};

/**
 * Логирование обновления задачи
 * @param {string} title - Название задачи
 * @param {Object} changes - Объект с изменениями
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logTaskUpdate('Implement user authentication', {status: 'completed', priority: 'high'}, '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logTaskUpdate = (title, changes, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo(
    'Task',
    'updated',
    `"${title}" by user ${userUuid} from IP: ${ip}, changes: ${JSON.stringify(changes)}`,
  );
};

/**
 * Логирование получения задач (только в development)
 * @param {number} tasksCount - Количество полученных задач
 * @param {number} totalTasks - Общее количество задач
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logTaskFetch(25, 100, '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logTaskFetch = (tasksCount, totalTasks, userUuid, ip) => {
  if (typeof tasksCount !== 'number') throw new Error('tasksCount must be a number');
  if (typeof totalTasks !== 'number') throw new Error('totalTasks must be a number');
  validateParams(userUuid, ip);
  
  if (process.env.NODE_ENV === 'development') {
    logInfo(
      'Task',
      'fetched',
      `${tasksCount}/${totalTasks} by user ${userUuid} from IP: ${ip}`,
    );
  }
};

/**
 * Логирование неудачного получения задач
 * @param {string} boardUuid - UUID доски
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {Error|string} error - Ошибка
 */
export const logTaskFetchFailure = (boardUuid, userUuid, ip, error) => {
  validateParams(userUuid, ip);
  logWarn('Task', 'fetch failure', `board: ${boardUuid}, user: ${userUuid}, ip: ${ip} - ${error?.message || error}`);
};

/**
 * Логирование неудачного создания задачи
 * @param {string} title - Название задачи
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {Error|string} error - Ошибка
 */
export const logTaskCreationFailure = (title, userUuid, ip, error) => {
  validateParams(userUuid, ip);
  logWarn('Task', 'creation failure', `title: ${title}, user: ${userUuid}, ip: ${ip} - ${error?.message || error}`);
};

/**
 * Логирование ошибки при работе с задачами
 * @param {string} action - Действие, которое вызвало ошибку
 * @param {Error} error - Объект ошибки
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logTaskError('creation', new Error('Database connection failed'), '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logTaskError = (action, error, userUuid, ip) => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logError('Task', action, `for user ${userUuid} from IP: ${ip}`, error);
};

/**
 * Логирование подозрительной активности при работе с задачами
 * @param {string} action - Действие, которое вызвало подозрение
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} [details=''] - Дополнительные детали
 * @example
 * logSuspiciousActivity('mass_deletion', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', 'Deleted 100 tasks in 1 minute');
 */
export const logSuspiciousActivity = (action, userUuid, ip, details = '') => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logSuspicious('Task', action, userUuid, ip, details);
};

/**
 * Логгирует попытку создания задачи
 * @param {string} title
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logTaskCreationAttempt(title, userUuid, ip, userAgent) {
  logInfo('Task', 'create_attempt', `[TASK_CREATE_ATTEMPT] title: ${title}, user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку удаления задачи
 * @param {string} taskUuid
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logTaskDeletionAttempt(taskUuid, userUuid, ip, userAgent) {
  logInfo('Task', 'delete_attempt', `[TASK_DELETE_ATTEMPT] task: ${taskUuid}, user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку обновления задачи
 * @param {string} taskUuid
 * @param {object} dataToUpdate
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logTaskUpdateAttempt(taskUuid, dataToUpdate, userUuid, ip, userAgent) {
  logInfo('Task', 'update_attempt', `[TASK_UPDATE_ATTEMPT] task: ${taskUuid}, user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, data: ${JSON.stringify(dataToUpdate)}`);
}

/**
 * Логгирует попытку получения задач
 * @param {string} boardUuid
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logTaskFetchAttempt(boardUuid, userUuid, ip, userAgent) {
  logInfo('Task', 'fetch_attempt', `[TASK_FETCH_ATTEMPT] board: ${boardUuid}, user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
