/**
 * @module loggers/mail
 * @description Логгеры для работы с почтой.
 */
import { logInfo, logError } from './baseLogger.js';

/**
 * Логирование успешной отправки письма
 * @param {string} messageId - ID отправленного письма
 * @example
 * logMailSendSuccess('msg_123456789');
 */
export const logMailSendSuccess = (messageId) => {
  logInfo('Mail', 'sendSuccess', `Письмо отправлено: ${messageId}`);
};

/**
 * Логирование ошибки отправки письма
 * @param {Error} error - Объект ошибки
 * @example
 * logMailSendError(new Error('SMTP connection failed'));
 */
export const logMailSendError = (error) => {
  logError('Mail', 'sendError', 'Ошибка при отправке письма', error);
};

/**
 * Логирование ошибки рендеринга email
 * @param {Error} error - Объект ошибки
 * @example
 * logMailRenderError(new Error('Template not found'));
 */
export const logMailRenderError = (error) => {
  logError('Mail', 'renderError', 'Ошибка при рендеринге email', error);
}; 