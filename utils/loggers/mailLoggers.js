import { logInfo, logError } from './baseLogger.js';

export const logMailSendSuccess = (messageId) => {
  logInfo('Mail', 'sendSuccess', `Письмо отправлено: ${messageId}`);
};

export const logMailSendError = (error) => {
  logError('Mail', 'sendError', 'Ошибка при отправке письма', error);
};

export const logMailRenderError = (error) => {
  logError('Mail', 'renderError', 'Ошибка при рендеринге email', error);
}; 