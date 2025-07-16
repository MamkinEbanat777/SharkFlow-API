/**
 * @module loggers/system
 * @description Системные логгеры.
 */
import { logInfo, logWarn, logError } from './baseLogger.js';

const validateParams = (ip) => {
  if (!ip) throw new Error('ip is required');
};

/**
 * Логирование запуска cron задачи
 * @param {string} jobName - Название cron задачи
 * @param {string} ip - IP адрес, с которого запущена задача
 * @example
 * logCronJobStart('deleteOldGuests', '127.0.0.1');
 */
export const logCronJobStart = (jobName, ip) => {
  if (!jobName) throw new Error('jobName is required');
  validateParams(ip);
  logInfo('System', 'cronStart', `${jobName} started from IP: ${ip}`);
};

/**
 * Логирование завершения cron задачи
 * @param {string} jobName - Название cron задачи
 * @param {string} ip - IP адрес, с которого запущена задача
 * @param {string} [result=''] - Результат выполнения задачи
 * @example
 * logCronJobComplete('deleteOldGuests', '127.0.0.1', 'Deleted 15 old guests');
 */
export const logCronJobComplete = (jobName, ip, result = '') => {
  if (!jobName) throw new Error('jobName is required');
  validateParams(ip);
  logInfo('System', 'cronComplete', `${jobName} completed from IP: ${ip}${result ? ` - ${result}` : ''}`);
};

/**
 * Логирование ошибки cron задачи
 * @param {string} jobName - Название cron задачи
 * @param {Error} error - Объект ошибки
 * @param {string} ip - IP адрес, с которого запущена задача
 * @example
 * logCronJobError('deleteOldGuests', new Error('Database connection failed'), '127.0.0.1');
 */
export const logCronJobError = (jobName, error, ip) => {
  if (!jobName) throw new Error('jobName is required');
  validateParams(ip);
  logError('System', 'cronError', `${jobName} failed from IP: ${ip}`, error);
};

/**
 * Логирование ошибки получения геолокации по IP
 * @param {string} ip - IP адрес
 * @param {Error} error - Объект ошибки
 * @example
 * logLocationError('192.168.1.1', new Error('Geolocation service unavailable'));
 */
export const logLocationError = (ip, error) => {
  validateParams(ip);
  logError('System', 'locationError', `Failed to get location for IP: ${ip}`, error);
};

/**
 * Логирование запуска сервера
 * @param {number|string} port - Порт, на котором запущен сервер
 * @example
 * logServerStart(8080);
 */
export const logServerStart = (port) => {
  if (!port) throw new Error('port is required');
  logInfo('System', 'serverStart', `Server started on port ${port}`);
};

/**
 * Логирование остановки сервера
 * @example
 * logServerStop();
 */
export const logServerStop = () => {
  logInfo('System', 'serverStop', 'Server stopped gracefully');
};

/**
 * Логирование ошибки базы данных
 * @param {string} operation - Операция, которая вызвала ошибку
 * @param {Error} error - Объект ошибки
 * @example
 * logDatabaseError('user creation', new Error('Duplicate entry'));
 */
export const logDatabaseError = (operation, error) => {
  if (!operation) throw new Error('operation is required');
  logError('System', 'databaseError', `Database operation failed: ${operation}`, error);
};

/**
 * Логирование ошибки внешнего сервиса
 * @param {string} service - Название внешнего сервиса
 * @param {string} operation - Операция, которая вызвала ошибку
 * @param {Error} error - Объект ошибки
 * @example
 * logExternalServiceError('Cloudinary', 'image upload', new Error('API key invalid'));
 */
export const logExternalServiceError = (service, operation, error) => {
  if (!service) throw new Error('service is required');
  if (!operation) throw new Error('operation is required');
  logError('System', 'externalServiceError', `${service} ${operation} failed`, error);
};

/**
 * Логгирует healthcheck-запрос
 * @param {string} ip
 * @param {string} userAgent
 * @param {string} status
 * @returns {void}
 */
export function logMonitorCheck(ip, userAgent, status) {
  logInfo('System', 'monitor_check', `[MONITOR_CHECK] ip: ${ip}, ua: ${userAgent}, status: ${status}`);
} 