/**
 * @module rateLimiters/board
 * @description Rate limiter'ы для работы с досками.
 */
const boardCreationAttempts = new Map();
const MAX_BOARDS_PER_MINUTE = 10;
const RATE_LIMIT_DURATION = 60 * 1000; 

/**
 * Проверяет лимит создания досок для пользователя
 * @param {string} userUuid - UUID пользователя
 * @returns {Object} Результат проверки
 */
export const checkBoardCreationRateLimit = (userUuid) => {
  const attempts = boardCreationAttempts.get(userUuid);
  
  if (attempts && attempts.count >= MAX_BOARDS_PER_MINUTE) {
    const timeLeft = attempts.resetTime - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000)
      };
    } else {
      boardCreationAttempts.delete(userUuid);
    }
  }
  return { blocked: false };
};

/**
 * Увеличивает счетчик попыток создания досок
 * @param {string} userUuid - UUID пользователя
 */
export const incrementBoardCreationAttempts = (userUuid) => {
  const attempts = boardCreationAttempts.get(userUuid) || { count: 0, resetTime: 0 };
  
  attempts.count++;
  
  if (attempts.count >= MAX_BOARDS_PER_MINUTE) {
    attempts.resetTime = Date.now() + RATE_LIMIT_DURATION;
  }
  
  boardCreationAttempts.set(userUuid, attempts);
  
  setTimeout(() => {
    boardCreationAttempts.delete(userUuid);
  }, RATE_LIMIT_DURATION);
};


const boardDeletionAttempts = new Map();
const MAX_DELETIONS_PER_MINUTE = 20;

/**
 * Проверяет лимит удаления досок для пользователя
 * @param {string} userUuid - UUID пользователя
 * @returns {Object} Результат проверки
 */
export const checkBoardDeletionRateLimit = (userUuid) => {
  const attempts = boardDeletionAttempts.get(userUuid);
  
  if (attempts && attempts.count >= MAX_DELETIONS_PER_MINUTE) {
    const timeLeft = attempts.resetTime - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000)
      };
    } else {
      boardDeletionAttempts.delete(userUuid);
    }
  }
  return { blocked: false };
};

/**
 * Увеличивает счетчик попыток удаления досок
 * @param {string} userUuid - UUID пользователя
 */
export const incrementBoardDeletionAttempts = (userUuid) => {
  const attempts = boardDeletionAttempts.get(userUuid) || { count: 0, resetTime: 0 };
  
  attempts.count++;
  
  if (attempts.count === 1) {
    attempts.resetTime = Date.now() + RATE_LIMIT_DURATION;
  }
  
  boardDeletionAttempts.set(userUuid, attempts);
  
  setTimeout(() => {
    boardDeletionAttempts.delete(userUuid);
  }, RATE_LIMIT_DURATION);
};


const boardFetchAttempts = new Map();
const MAX_FETCHES_PER_MINUTE = 30;

/**
 * Проверяет лимит получения досок для пользователя
 * @param {string} userUuid - UUID пользователя
 * @returns {Object} Результат проверки
 */
export const checkBoardFetchRateLimit = (userUuid) => {
  const attempts = boardFetchAttempts.get(userUuid);
  
  if (attempts && attempts.count >= MAX_FETCHES_PER_MINUTE) {
    const timeLeft = attempts.resetTime - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000)
      };
    } else {
      boardFetchAttempts.delete(userUuid);
    }
  }
  return { blocked: false };
};

/**
 * Увеличивает счетчик попыток получения досок
 * @param {string} userUuid - UUID пользователя
 */
export const incrementBoardFetchAttempts = (userUuid) => {
  const attempts = boardFetchAttempts.get(userUuid) || { count: 0, resetTime: 0 };
  
  attempts.count++;
  
  if (attempts.count === 1) {
    attempts.resetTime = Date.now() + RATE_LIMIT_DURATION;
  }
  
  boardFetchAttempts.set(userUuid, attempts);
  
  setTimeout(() => {
    boardFetchAttempts.delete(userUuid);
  }, RATE_LIMIT_DURATION);
};


const boardUpdateAttempts = new Map();
const MAX_UPDATES_PER_MINUTE = 30;

/**
 * Проверяет лимит обновления досок для пользователя
 * @param {string} userUuid - UUID пользователя
 * @returns {Object} Результат проверки
 */
export const checkBoardUpdateRateLimit = (userUuid) => {
  const attempts = boardUpdateAttempts.get(userUuid);
  
  if (attempts && attempts.count >= MAX_UPDATES_PER_MINUTE) {
    const timeLeft = attempts.resetTime - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000)
      };
    } else {
      boardUpdateAttempts.delete(userUuid);
    }
  }
  return { blocked: false };
};

/**
 * Увеличивает счетчик попыток обновления досок
 * @param {string} userUuid - UUID пользователя
 */
export const incrementBoardUpdateAttempts = (userUuid) => {
  const attempts = boardUpdateAttempts.get(userUuid) || { count: 0, resetTime: 0 };
  
  attempts.count++;
  
  if (attempts.count === 1) {
    attempts.resetTime = Date.now() + RATE_LIMIT_DURATION;
  }
  
  boardUpdateAttempts.set(userUuid, attempts);
  
  setTimeout(() => {
    boardUpdateAttempts.delete(userUuid);
  }, RATE_LIMIT_DURATION);
};

