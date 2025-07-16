import { logInfo, logWarn, logError, logSuspicious } from './baseLogger.js';

/**
 * Формирует строку деталей для логов с ip и userAgent.
 * @param {string} details
 * @param {string} ip
 * @param {string} userAgent
 * @returns {string}
 */
const formatDetails = (details, ip, userAgent) => {
  let msg = details;
  if (ip) msg += ` | ip: ${ip}`;
  if (userAgent) msg += ` | userAgent: ${userAgent}`;
  return msg;
};

/**
 * @module loggers/adminLoggers
 * @description Логгеры для действий в админ-панели.
 */

/**
 * Логирует информационные действия в админке.
 * @param {string} action - Действие (например, 'login', 'updateUser')
 * @param {string} details - Детали события
 * @param {string} ip - IP-адрес
 * @param {string} userAgent - User-Agent браузера
 */
export const logAdminInfo = (action, details, ip, userAgent) => {
  logInfo('Admin', action, formatDetails(details, ip, userAgent));
};

/**
 * Логирует предупреждения в админке.
 * @param {string} action - Действие
 * @param {string} details - Детали
 * @param {string} ip - IP-адрес
 * @param {string} userAgent - User-Agent браузера
 */
export const logAdminWarn = (action, details, ip, userAgent) => {
  logWarn('Admin', action, formatDetails(details, ip, userAgent));
};

/**
 * Логирует ошибки в админке.
 * @param {string} action - Действие
 * @param {string} details - Детали
 * @param {Error} [error] - Объект ошибки
 * @param {string} ip - IP-адрес
 * @param {string} userAgent - User-Agent браузера
 */
export const logAdminError = (action, details, error, ip, userAgent) => {
  logError('Admin', action, formatDetails(details, ip, userAgent), error);
};

/**
 * Логирует подозрительные действия в админке (например, неудачные попытки входа).
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP-адрес
 * @param {string} [extra] - Дополнительная информация
 * @param {string} userAgent - User-Agent браузера
 */
export const logAdminSecurity = (userUuid, ip, extra = '', userAgent) => {
  logSuspicious('Admin', 'security', userUuid, ip, formatDetails(extra, ip, userAgent));
}; 