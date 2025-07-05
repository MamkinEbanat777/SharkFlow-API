const boardCreationAttempts = new Map();
const MAX_BOARDS_PER_MINUTE = 10;
const RATE_LIMIT_DURATION = 60 * 1000; 

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

// setInterval(() => {
//   const now = Date.now();
//   [boardCreationAttempts, boardDeletionAttempts, boardFetchAttempts, boardUpdateAttempts].forEach(map => {
//     for (const [key, value] of map.entries()) {
//       if (value.resetTime && value.resetTime < now) {
//         map.delete(key);
//       }
//     }
//   });
// }, 10 * 60 * 1000); 
