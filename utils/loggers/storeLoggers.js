import { logError } from './baseLogger.js';

export const logStoreError = (action, key, error) => {
  logError('Store', action, `Ошибка для ключа: ${key}`, error);
}; 