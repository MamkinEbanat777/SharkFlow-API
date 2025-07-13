const taskCreationAttempts = new Map();
const MAX_TASKS_PER_MINUTE = 10;
const RATE_LIMIT_DURATION = 60 * 1000; 

/**
 * Проверяет лимит создания задач для пользователя
 * @param {string} userUuid - UUID пользователя
 * @returns {Object} Результат проверки
 */
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

/**
 * Увеличивает счетчик попыток создания задач
 * @param {string} userUuid - UUID пользователя
 */
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

/**
 * Проверяет лимит удаления задач для пользователя
 * @param {string} userUuid - UUID пользователя
 * @returns {Object} Результат проверки
 */
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

/**
 * Увеличивает счетчик попыток удаления задач
 * @param {string} userUuid - UUID пользователя
 */
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

/**
 * Проверяет лимит получения задач для пользователя
 * @param {string} userUuid - UUID пользователя
 * @returns {Object} Результат проверки
 */
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

/**
 * Увеличивает счетчик попыток получения задач
 * @param {string} userUuid - UUID пользователя
 */
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

/**
 * Проверяет лимит обновления задач для пользователя
 * @param {string} userUuid - UUID пользователя
 * @returns {Object} Результат проверки
 */
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

/**
 * Увеличивает счетчик попыток обновления задач
 * @param {string} userUuid - UUID пользователя
 */
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
