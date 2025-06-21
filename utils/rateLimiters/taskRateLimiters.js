const taskCreationAttempts = new Map();
const MAX_TASKS_PER_MINUTE = 10;
const RATE_LIMIT_DURATION = 60 * 1000; 

export const checkTaskCreationRateLimit = (userUuid) => {
  const attempts = taskCreationAttempts.get(userUuid);
  
  if (attempts && attempts.count >= MAX_TASKS_PER_MINUTE) {
    const timeLeft = attempts.resetTime - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000)
      };
    } else {
      taskCreationAttempts.delete(userUuid);
    }
  }
  return { blocked: false };
};

export const incrementTaskCreationAttempts = (userUuid) => {
  const attempts = taskCreationAttempts.get(userUuid) || { count: 0, resetTime: 0 };
  
  attempts.count++;
  
  if (attempts.count >= MAX_TASKS_PER_MINUTE) {
    attempts.resetTime = Date.now() + RATE_LIMIT_DURATION;
  }
  
  taskCreationAttempts.set(userUuid, attempts);
  
  setTimeout(() => {
    taskCreationAttempts.delete(userUuid);
  }, RATE_LIMIT_DURATION);
};


const taskDeletionAttempts = new Map();
const MAX_DELETIONS_PER_MINUTE = 20;

export const checkTaskDeletionRateLimit = (userUuid) => {
  const attempts = taskDeletionAttempts.get(userUuid);
  
  if (attempts && attempts.count >= MAX_DELETIONS_PER_MINUTE) {
    const timeLeft = attempts.resetTime - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000)
      };
    } else {
      taskDeletionAttempts.delete(userUuid);
    }
  }
  return { blocked: false };
};

export const incrementTaskDeletionAttempts = (userUuid) => {
  const attempts = taskDeletionAttempts.get(userUuid) || { count: 0, resetTime: 0 };
  
  attempts.count++;
  
  if (attempts.count === 1) {
    attempts.resetTime = Date.now() + RATE_LIMIT_DURATION;
  }
  
  taskDeletionAttempts.set(userUuid, attempts);
  
  setTimeout(() => {
    taskDeletionAttempts.delete(userUuid);
  }, RATE_LIMIT_DURATION);
};


const taskFetchAttempts = new Map();
const MAX_FETCHES_PER_MINUTE = 30;

export const checkTaskFetchRateLimit = (userUuid) => {
  const attempts = taskFetchAttempts.get(userUuid);
  
  if (attempts && attempts.count >= MAX_FETCHES_PER_MINUTE) {
    const timeLeft = attempts.resetTime - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000)
      };
    } else {
      taskFetchAttempts.delete(userUuid);
    }
  }
  return { blocked: false };
};

export const incrementTaskFetchAttempts = (userUuid) => {
  const attempts = taskFetchAttempts.get(userUuid) || { count: 0, resetTime: 0 };
  
  attempts.count++;
  
  if (attempts.count === 1) {
    attempts.resetTime = Date.now() + RATE_LIMIT_DURATION;
  }
  
  taskFetchAttempts.set(userUuid, attempts);
  
  setTimeout(() => {
    taskFetchAttempts.delete(userUuid);
  }, RATE_LIMIT_DURATION);
};


const taskUpdateAttempts = new Map();
const MAX_UPDATES_PER_MINUTE = 10;

export const checkTaskUpdateRateLimit = (userUuid) => {
  const attempts = taskUpdateAttempts.get(userUuid);
  
  if (attempts && attempts.count >= MAX_UPDATES_PER_MINUTE) {
    const timeLeft = attempts.resetTime - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000)
      };
    } else {
      taskUpdateAttempts.delete(userUuid);
    }
  }
  return { blocked: false };
};

export const incrementTaskUpdateAttempts = (userUuid) => {
  const attempts = taskUpdateAttempts.get(userUuid) || { count: 0, resetTime: 0 };
  
  attempts.count++;
  
  if (attempts.count === 1) {
    attempts.resetTime = Date.now() + RATE_LIMIT_DURATION;
  }
  
  taskUpdateAttempts.set(userUuid, attempts);
  
  setTimeout(() => {
    taskUpdateAttempts.delete(userUuid);
  }, RATE_LIMIT_DURATION);
};

// setInterval(() => {
//   const now = Date.now();
//   [taskCreationAttempts, taskDeletionAttempts, taskFetchAttempts, taskUpdateAttempts].forEach(map => {
//     for (const [key, value] of map.entries()) {
//       if (value.resetTime && value.resetTime < now) {
//         map.delete(key);
//       }
//     }
//   });
// }, 10 * 60 * 1000); 