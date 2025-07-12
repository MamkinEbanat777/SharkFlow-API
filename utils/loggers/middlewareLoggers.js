import { logError } from './baseLogger.js';

export const logAuthMiddlewareError = (action, ip, error) => {
  logError('AuthMiddleware', action, `from ${ip}`, error);
};

export const logTelegramMiddlewareError = (action, ip, error) => {
  logError('TelegramMiddleware', action, `from ${ip}`, error);
}; 