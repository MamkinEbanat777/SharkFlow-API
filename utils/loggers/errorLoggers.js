import { logError } from './baseLogger.js';

/**
 * Логирование ошибки в обработчике маршрута
 * @param {string} action - Действие, которое вызвало ошибку
 * @param {string} details - Детали ошибки
 * @param {Error} error - Объект ошибки
 * @example
 * logRouteHandlerError('user_creation', 'Failed to create user in database', new Error('Database connection failed'));
 */
export const logRouteHandlerError = (action, details, error) => {
  logError('RouteHandler', action, details, error);
}; 