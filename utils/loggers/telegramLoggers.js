import { logInfo, logWarn, logError } from './baseLogger.js';

const validateParams = (userUuid, ip) => {
  if (!userUuid) throw new Error('userUuid is required');
  if (!ip) throw new Error('ip is required');
};

export const logTelegramUnlinkSuccess = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Telegram', 'unlinkSuccess', `${userUuid} from IP: ${ip}`);
};

export const logTelegramUnlinkError = (userUuid, ip, error) => {
  validateParams(userUuid, ip);
  logError('Telegram', 'unlinkError', `${userUuid} from IP: ${ip}`, error);
};

export const logTelegramLinkSuccess = (userUuid, telegramId, ip) => {
  validateParams(userUuid, ip);
  if (!telegramId) throw new Error('telegramId is required');
  logInfo('Telegram', 'linkSuccess', `${userUuid} (${telegramId}) from IP: ${ip}`);
};

export const logTelegramLinkError = (userUuid, ip, error) => {
  validateParams(userUuid, ip);
  logError('Telegram', 'linkError', `${userUuid} from IP: ${ip}`, error);
};

export const logTelegramCommand = (command, userUuid, ip) => {
  if (!command) throw new Error('command is required');
  validateParams(userUuid, ip);
  logInfo('Telegram', command, `${userUuid} from IP: ${ip}`);
};

export const logTelegramCommandError = (command, userUuid, ip, error) => {
  if (!command) throw new Error('command is required');
  validateParams(userUuid, ip);
  logError('Telegram', `${command}Error`, `${userUuid} from IP: ${ip}`, error);
};

export const logTelegramWebhook = (userUuid, action, ip) => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logInfo('Telegram', 'webhook', `${action} for ${userUuid} from IP: ${ip}`);
};

export const logTelegramWebhookError = (userUuid, action, ip, error) => {
  if (!action) throw new Error('action is required');
  validateParams(userUuid, ip);
  logError('Telegram', 'webhookError', `${action} for ${userUuid} from IP: ${ip}`, error);
}; 