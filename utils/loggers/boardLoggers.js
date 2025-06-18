
export const logBoardCreation = (title, userUuid, ipAddress) => {
  console.log(`Board created: "${title}" by user ${userUuid} from IP: ${ipAddress}`);
};

export const logBoardDeletion = (title, taskCount, userUuid, ipAddress) => {
  console.log(`Board deleted: "${title}" (${taskCount} tasks) by user ${userUuid} from IP: ${ipAddress}`);
};

export const logBoardUpdate = (title, changes, userUuid, ipAddress) => {
  console.log(`Board updated: "${title}" by user ${userUuid} from IP: ${ipAddress}, changes: ${JSON.stringify(changes)}`);
};

export const logBoardFetch = (boardsCount, totalBoards, userUuid, ipAddress) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Boards fetched: ${boardsCount}/${totalBoards} by user ${userUuid} from IP: ${ipAddress}`);
  }
};

export const logBoardError = (action, error, userUuid, ipAddress) => {
  console.error(`Board ${action} error for user ${userUuid} from IP: ${ipAddress}:`, error);
};

export const logSuspiciousActivity = (action, userUuid, ipAddress, details = '') => {
  console.warn(`Suspicious board activity: ${action} by user ${userUuid} from IP: ${ipAddress} ${details}`);
}; 