import { logInfo, logWarn, logError, logSuspicious } from './baseLogger.js';

export const logBoardCreation = (title, userUuid, ip) =>
  logInfo('Board', 'created', `"${title}" by user ${userUuid} from IP: ${ip}`);

export const logBoardDeletion = (title, taskCount, userUuid, ip) =>
  logInfo('Board', 'deleted', `"${title}" (${taskCount} tasks) by user ${userUuid} from IP: ${ip}`);

export const logBoardUpdate = (title, changes, userUuid, ip) =>
  logInfo('Board', 'updated', `"${title}" by user ${userUuid} from IP: ${ip}, changes: ${JSON.stringify(changes)}`);

export const logBoardFetch = (boardsCount, totalBoards, userUuid, ip) => {
  if (process.env.NODE_ENV === 'development') {
    logInfo('Board', 'fetched', `${boardsCount}/${totalBoards} by user ${userUuid} from IP: ${ip}`);
  }
};

export const logBoardError = (action, error, userUuid, ip) =>
  logError('Board', action, `for user ${userUuid} from IP: ${ip}`, error);

export const logSuspiciousActivity = (action, userUuid, ip, details = '') =>
  logSuspicious('Board', action, userUuid, ip, details); 