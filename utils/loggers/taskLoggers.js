import { logInfo, logWarn, logError, logSuspicious } from './baseLogger.js';

const validateParams = (userUuid, ip) => {
  if (!userUuid) throw new Error('userUuid is required');
  if (!ip) throw new Error('ip is required');
};

export const logTaskCreation = (title, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo('Task', 'created', `"${title}" by user ${userUuid} from IP: ${ip}`);
};

export const logTaskDeletion = (title, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo('Task', 'deleted', `"${title}" by user ${userUuid} from IP: ${ip}`);
};

export const logTaskUpdate = (title, changes, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo(
    'Task',
    'updated',
    `"${title}" by user ${userUuid} from IP: ${ip}, changes: ${JSON.stringify(changes)}`,
  );
};

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

export const logTaskError = (action, error, userUuid, ip) => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logError('Task', action, `for user ${userUuid} from IP: ${ip}`, error);
};

export const logSuspiciousActivity = (action, userUuid, ip, details = '') => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logSuspicious('Task', action, userUuid, ip, details);
};
