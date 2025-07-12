import { logInfo, logWarn, logError, logSuspicious } from './baseLogger.js';

const validateParams = (userUuid, ip) => {
  if (!userUuid) throw new Error('userUuid is required');
  if (!ip) throw new Error('ip is required');
};

export const logBoardCreation = (title, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo('Board', 'created', `"${title}" by user ${userUuid} from IP: ${ip}`);
};

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

export const logBoardUpdate = (title, changes, userUuid, ip) => {
  if (!title) throw new Error('title is required');
  validateParams(userUuid, ip);
  logInfo(
    'Board',
    'updated',
    `"${title}" by user ${userUuid} from IP: ${ip}, changes: ${JSON.stringify(changes)}`,
  );
};

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

export const logBoardError = (action, error, userUuid, ip) => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logError('Board', action, `for user ${userUuid} from IP: ${ip}`, error);
};

export const logSuspiciousActivity = (action, userUuid, ip, details = '') => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logSuspicious('Board', action, userUuid, ip, details);
};
