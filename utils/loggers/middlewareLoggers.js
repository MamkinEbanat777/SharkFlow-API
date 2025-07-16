/**
 * @module loggers/middleware
 * @description Логгеры для middleware.
 */
import { logError } from './baseLogger.js';

/**
 * Логирование ошибки в middleware аутентификации
 * @param {string} action - Действие, которое вызвало ошибку
 * @param {string} ip - IP адрес клиента
 * @param {Error} error - Объект ошибки
 * @example
 * logAuthMiddlewareError('token_validation', '192.168.1.1', new Error('Invalid token format'));
 */
export const logAuthMiddlewareError = (action, ip, ua, error) => {
  logError('AuthMiddleware', action, `from ${ip}, ua: ${ua}`, error);
};

/**
 * Логирование ошибки в Telegram middleware
 * @param {string} action - Действие, которое вызвало ошибку
 * @param {string} ip - IP адрес клиента
 * @param {Error} error - Объект ошибки
 * @example
 * logTelegramMiddlewareError('webhook_validation', '192.168.1.1', new Error('Invalid signature'));
 */
export const logTelegramMiddlewareError = (action, ip, error) => {
  logError('TelegramMiddleware', action, `from ${ip}`, error);
}; 