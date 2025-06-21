
export const logTaskCreation = (title, userUuid, ipAddress) => {
  console.log(`Task created: "${title}" by user ${userUuid} from IP: ${ipAddress}`);
};

export const logTaskDeletion = (title, userUuid, ipAddress) => {
  console.log(`Task deleted: "${title}" by user ${userUuid} from IP: ${ipAddress}`);
};

export const logTaskUpdate = (title, changes, userUuid, ipAddress) => {
  console.log(`Task updated: "${title}" by user ${userUuid} from IP: ${ipAddress}, changes: ${JSON.stringify(changes)}`);
};

export const logTaskFetch = (tasksCount, totalTasks, userUuid, ipAddress) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Tasks fetched: ${tasksCount}/${totalTasks} by user ${userUuid} from IP: ${ipAddress}`);
  }
};

export const logTaskError = (action, error, userUuid, ipAddress) => {
  console.error(`Task ${action} error for user ${userUuid} from IP: ${ipAddress}:`, error);
};

export const logSuspiciousActivity = (action, userUuid, ipAddress, details = '') => {
  console.warn(`Suspicious task activity: ${action} by user ${userUuid} from IP: ${ipAddress} ${details}`);
}; 