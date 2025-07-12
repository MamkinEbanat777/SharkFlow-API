import { logRouteHandlerError } from '../loggers/errorLoggers.js';

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
