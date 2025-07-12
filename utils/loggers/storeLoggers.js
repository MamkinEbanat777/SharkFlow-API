import { logError } from './baseLogger.js';

/**
 * Логирование ошибки в хранилище данных
 * @param {string} action - Действие, которое вызвало ошибку
 * @param {string} key - Ключ в хранилище
 * @param {Error} error - Объект ошибки
 * @example
 * logStoreError('get', 'user:123', new Error('Redis connection failed'));
 */
export const logStoreError = (action, key, error) => {
  logError('Store', action, `Ошибка для ключа: ${key}`, error);
}; 