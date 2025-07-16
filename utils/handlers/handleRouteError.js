/**
 * @module handlers/routeError
 * @description Обработчики ошибок для маршрутов.
 */
import { logRouteHandlerError } from '#utils/loggers/errorLoggers.js';

/**
 * Обрабатывает ошибки в роутах и отправляет ответ клиенту
 * @param {Object} res - Express response объект
 * @param {Error} error - Объект ошибки
 * @param {Object} [options={}] - Опции обработки ошибки
 * @param {string} [options.message='Внутренняя ошибка сервера'] - Сообщение для клиента
 * @param {number} [options.status=500] - HTTP статус код
 * @param {string} [options.logPrefix='Route Error'] - Префикс для логов
 * @param {string} [options.requestId=null] - ID запроса для логирования
 */
export const handleRouteError = (res, error, options = {}) => {
  const {
    message = 'Внутренняя ошибка сервера',
    status = 500,
    logPrefix = 'Route Error',
    requestId = null,
  } = options;

  if (res.headersSent) {
    logRouteHandlerError('responseAlreadySent', `${logPrefix}: Response already sent, cannot send error response`);
    return;
  }

  if (requestId) {
    logRouteHandlerError(logPrefix, `[${requestId}]: ${error.message}`, error);
  } else {
    logRouteHandlerError(logPrefix, error.message, error);
  }

  if (res.headersSent) {
    return;
  }

  res.status(status).json({ error: message });
}; 
