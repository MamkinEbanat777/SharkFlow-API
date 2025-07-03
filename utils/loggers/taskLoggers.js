import { logInfo, logWarn, logError, logSuspicious } from './baseLogger.js';

export const logTaskCreation = (title, userUuid, ip) =>
  logInfo('Task', 'created', `"${title}" by user ${userUuid} from IP: ${ip}`);

export const logTaskDeletion = (title, userUuid, ip) =>
  logInfo('Task', 'deleted', `"${title}" by user ${userUuid} from IP: ${ip}`);

export const logTaskUpdate = (title, changes, userUuid, ip) =>
  logInfo(
    'Task',
    'updated',
    `"${title}" by user ${userUuid} from IP: ${ip}, changes: ${JSON.stringify(
      changes,
    )}`,
  );

export const logTaskFetch = (tasksCount, totalTasks, userUuid, ip) => {
  if (process.env.NODE_ENV === 'development') {
    logInfo(
      'Task',
      'fetched',
      `${tasksCount}/${totalTasks} by user ${userUuid} from IP: ${ip}`,
    );
  }
};

export const logTaskError = (action, error, userUuid, ip) =>
  logError('Task', action, `for user ${userUuid} from IP: ${ip}`, error);

export const logSuspiciousActivity = (action, userUuid, ip, details = '') =>
  logSuspicious('Task', action, userUuid, ip, details);
