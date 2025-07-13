/**
 * @module loggers/telegram
 * @description Логгеры для Telegram бота.
 */
import { logInfo, logWarn, logError } from './baseLogger.js';

const validateParams = (userUuid, ip) => {
  if (!userUuid) throw new Error('userUuid is required');
  if (!ip) throw new Error('ip is required');
};

/**
 * Логирование успешного отвязывания Telegram аккаунта
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logTelegramUnlinkSuccess('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logTelegramUnlinkSuccess = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Telegram', 'unlinkSuccess', `${userUuid} from IP: ${ip}`);
};

/**
 * Логирование ошибки отвязывания Telegram аккаунта
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {Error} error - Объект ошибки
 * @example
 * logTelegramUnlinkError('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', new Error('Telegram API error'));
 */
export const logTelegramUnlinkError = (userUuid, ip, error) => {
  validateParams(userUuid, ip);
  logError('Telegram', 'unlinkError', `${userUuid} from IP: ${ip}`, error);
};

/**
 * Логирование успешного привязывания Telegram аккаунта
 * @param {string} userUuid - UUID пользователя
 * @param {string} telegramId - Telegram ID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logTelegramLinkSuccess('123e4567-e89b-12d3-a456-426614174000', '123456789', '192.168.1.1');
 */
export const logTelegramLinkSuccess = (userUuid, telegramId, ip) => {
  validateParams(userUuid, ip);
  if (!telegramId) throw new Error('telegramId is required');
  logInfo('Telegram', 'linkSuccess', `${userUuid} (${telegramId}) from IP: ${ip}`);
};

/**
 * Логирование ошибки привязывания Telegram аккаунта
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {Error} error - Объект ошибки
 * @example
 * logTelegramLinkError('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', new Error('Invalid token'));
 */
export const logTelegramLinkError = (userUuid, ip, error) => {
  validateParams(userUuid, ip);
  logError('Telegram', 'linkError', `${userUuid} from IP: ${ip}`, error);
};

/**
 * Логирование выполнения Telegram команды
 * @param {string} command - Название команды
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logTelegramCommand('/start', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logTelegramCommand = (command, userUuid, ip) => {
  if (!command) throw new Error('command is required');
  validateParams(userUuid, ip);
  logInfo('Telegram', command, `${userUuid} from IP: ${ip}`);
};

/**
 * Логирование ошибки выполнения Telegram команды
 * @param {string} command - Название команды
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {Error} error - Объект ошибки
 * @example
 * logTelegramCommandError('/boards', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', new Error('Database error'));
 */
export const logTelegramCommandError = (command, userUuid, ip, error) => {
  if (!command) throw new Error('command is required');
  validateParams(userUuid, ip);
  logError('Telegram', `${command}Error`, `${userUuid} from IP: ${ip}`, error);
};

/**
 * Логирование Telegram webhook
 * @param {string} userUuid - UUID пользователя
 * @param {string} action - Действие в webhook
 * @param {string} ip - IP адрес клиента
 * @example
 * logTelegramWebhook('123e4567-e89b-12d3-a456-426614174000', 'message_received', '192.168.1.1');
 */
export const logTelegramWebhook = (userUuid, action, ip) => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logInfo('Telegram', 'webhook', `${action} for ${userUuid} from IP: ${ip}`);
};

/**
 * Логирование ошибки Telegram webhook
 * @param {string} userUuid - UUID пользователя
 * @param {string} action - Действие в webhook
 * @param {string} ip - IP адрес клиента
 * @param {Error} error - Объект ошибки
 * @example
 * logTelegramWebhookError('123e4567-e89b-12d3-a456-426614174000', 'message_processing', '192.168.1.1', new Error('Invalid message format'));
 */
export const logTelegramWebhookError = (userUuid, action, ip, error) => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logError('Telegram', 'webhookError', `${action} for ${userUuid} from IP: ${ip}`, error);
}; 