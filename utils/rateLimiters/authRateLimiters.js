
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_DURATION = 5 * 60 * 1000; 

export const checkLoginRateLimit = (ipAddress, email) => {
  const key = `${ipAddress}-${email}`;
  const attempts = loginAttempts.get(key);
  
  if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeLeft = attempts.blockedUntil - Date.now();
    if (timeLeft > 0) {
      return {
        blocked: true,
        timeLeft: Math.ceil(timeLeft / 1000 / 60) 
      };
    } else {
      loginAttempts.delete(key);
    }
  }
  return { blocked: false };
};

export const incrementLoginAttempts = (ipAddress, email) => {
  const key = `${ipAddress}-${email}`;
  const attempts = loginAttempts.get(key) || { count: 0, blockedUntil: 0 };
  
  attempts.count++;
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.blockedUntil = Date.now() + LOGIN_BLOCK_DURATION;
  }
  
  loginAttempts.set(key, attempts);
  
  setTimeout(() => {
    loginAttempts.delete(key);
  }, LOGIN_BLOCK_DURATION);
};

export const resetLoginAttempts = (ipAddress, email) => {
  const key = `${ipAddress}-${email}`;
  loginAttempts.delete(key);
}; 