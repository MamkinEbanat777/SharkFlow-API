/**
 * @module loggers/auth
 * @description Логгеры для аутентификации и авторизации.
 */
import { logInfo, logWarn, logError, logSuspicious } from './baseLogger.js';

const filterSensitiveData = (changes) => {
  if (!changes || typeof changes !== 'object') return changes;
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  const filtered = { ...changes };
  
  sensitiveFields.forEach(field => {
    if (filtered[field]) {
      filtered[field] = '[REDACTED]';
    }
  });
  
  return filtered;
};

export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '[NO_EMAIL]';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 3)}***@${domain}`;
};

const validateParams = (userUuid, ip) => {
  if (!userUuid) throw new Error('userUuid is required');
  if (!ip) throw new Error('ip is required');
};

/**
 * Логирование успешного входа пользователя
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logLoginSuccess('user@example.com', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logLoginSuccess = (email, userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'login success', `${maskEmail(email)} (${userUuid}) from IP: ${ip}`);
};

/**
 * Логирование неудачной попытки входа
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} ip - IP адрес клиента
 * @param {string} [reason='Invalid credentials'] - Причина неудачи
 * @example
 * logLoginFailure('user@example.com', '192.168.1.1', 'Wrong password');
 */
export const logLoginFailure = (email, ip, reason = 'Invalid credentials') => {
  if (!ip) throw new Error('ip is required');
  logWarn('Auth', 'login failure', `${maskEmail(email)} from IP: ${ip} - ${reason}`);
};

/**
 * Логирование выхода пользователя
 * @param {string} login - Логин пользователя
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logLogout('john_doe', 'john@example.com', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logLogout = (login, email, userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'logout', `${login} (${maskEmail(email)}) (${userUuid}) from IP: ${ip}`);
};

/**
 * Логирование попытки выхода с недействительным токеном
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logLogoutInvalidToken('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logLogoutInvalidToken = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logWarn('Auth', 'logout invalid token', `from IP: ${ip}, user: ${userUuid}`);
};

/**
 * Логирование обновления токена
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {boolean} [rotated=false] - Флаг ротации токена
 * @example
 * logTokenRefresh('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', true);
 */
export const logTokenRefresh = (userUuid, ip, rotated = false) => {
  validateParams(userUuid, ip);
  logInfo(
    'Auth',
    'token refresh',
    `${userUuid} from IP: ${ip}${rotated ? ' (rotated)' : ''}`,
  );
};

/**
 * Логирование неудачного обновления токена
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина неудачи
 * @example
 * logTokenRefreshFailure('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', 'Token expired');
 */
export const logTokenRefreshFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'token refresh failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

/**
 * Логирование запроса на регистрацию
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} ip - IP адрес клиента
 * @example
 * logRegistrationRequest('newuser@example.com', '192.168.1.1');
 */
export const logRegistrationRequest = (email, ip) => {
  if (!ip) throw new Error('ip is required');
  logInfo('Auth', 'registration request', `${maskEmail(email)} from IP: ${ip}`);
};

/**
 * Логирование успешной регистрации
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {number} userId - ID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logRegistrationSuccess('newuser@example.com', 123, '192.168.1.1');
 */
export const logRegistrationSuccess = (email, userId, ip) => {
  if (!userId) throw new Error('userId is required');
  if (!ip) throw new Error('ip is required');
  logInfo(
    'Auth',
    'registration success',
    `${maskEmail(email)} (${userId}) from IP: ${ip}`,
  );
};

/**
 * Логирование неудачной регистрации
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина неудачи
 * @example
 * logRegistrationFailure('newuser@example.com', '192.168.1.1', 'Email already exists');
 */
export const logRegistrationFailure = (email, ip, reason) => {
  if (!ip) throw new Error('ip is required');
  logWarn(
    'Auth',
    'registration failure',
    `${maskEmail(email)} from IP: ${ip} - ${reason}`,
  );
};

/**
 * Логирование получения данных пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logUserFetch('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logUserFetch = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'user fetch', `${userUuid} from IP: ${ip}`);
};

/**
 * Логирование обновления данных пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {Object} changes - Объект с изменениями (чувствительные данные будут отфильтрованы)
 * @param {string} ip - IP адрес клиента
 * @example
 * logUserUpdate('123e4567-e89b-12d3-a456-426614174000', {name: 'John', email: 'john@example.com'}, '192.168.1.1');
 */
export const logUserUpdate = (userUuid, changes, ip) => {
  validateParams(userUuid, ip);
  const filteredChanges = filterSensitiveData(changes);
  logInfo(
    'Auth',
    'user update',
    `${userUuid} from IP: ${ip}, changes: ${JSON.stringify(filteredChanges)}`,
  );
};

/**
 * Логирование неудачного обновления данных пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина неудачи
 * @example
 * logUserUpdateFailure('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', 'Validation failed');
 */
export const logUserUpdateFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'user update failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

/**
 * Логирование запроса на обновление данных пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} ip - IP адрес клиента
 * @example
 * logUserUpdateRequest('123e4567-e89b-12d3-a456-426614174000', 'john@example.com', '192.168.1.1');
 */
export const logUserUpdateRequest = (userUuid, email, ip) => {
  validateParams(userUuid, ip);
  logInfo(
    'Auth',
    'user update request',
    `${userUuid} (${maskEmail(email)}) from IP: ${ip}`,
  );
};

/**
 * Логирование неудачного запроса на обновление данных пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина неудачи
 * @example
 * logUserUpdateRequestFailure('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', 'Invalid data');
 */
export const logUserUpdateRequestFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'user update request failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

/**
 * Логирование удаления пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logUserDelete('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logUserDelete = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'user delete', `${userUuid} from IP: ${ip}`);
};

/**
 * Логирование неудачного удаления пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина неудачи
 * @example
 * logUserDeleteFailure('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', 'User not found');
 */
export const logUserDeleteFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'user delete failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

/**
 * Логирование запроса на удаление пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} ip - IP адрес клиента
 * @example
 * logUserDeleteRequest('123e4567-e89b-12d3-a456-426614174000', 'john@example.com', '192.168.1.1');
 */
export const logUserDeleteRequest = (userUuid, email, ip) => {
  validateParams(userUuid, ip);
  logInfo(
    'Auth',
    'user delete request',
    `${userUuid} (${maskEmail(email)}) from IP: ${ip}`,
  );
};

/**
 * Логирование неудачного запроса на удаление пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина неудачи
 * @example
 * logUserDeleteRequestFailure('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', 'Permission denied');
 */
export const logUserDeleteRequestFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'user delete request failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

/**
 * Логирование подозрительной активности в аутентификации
 * @param {string} action - Действие, которое вызвало подозрение
 * @param {string} identifier - Идентификатор пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} [details=''] - Дополнительные детали
 * @example
 * logSuspiciousAuthActivity('multiple_failed_logins', 'john@example.com', '192.168.1.1', '5 attempts in 1 minute');
 */
export const logSuspiciousAuthActivity = (
  action,
  identifier,
  ip,
  details = '',
) => {
  if (!action) throw new Error('action is required');
  if (!identifier) throw new Error('identifier is required');
  if (!ip) throw new Error('ip is required');
  logSuspicious('Auth', action, identifier, ip, details);
};

/**
 * Логирование успешного отвязывания Google аккаунта
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logGoogleUnlinkSuccess('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logGoogleUnlinkSuccess = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'google unlink', `${userUuid} from IP: ${ip}`);
};

/**
 * Логирование неудачного отвязывания Google аккаунта
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина неудачи
 * @example
 * logGoogleUnlinkFailure('123e4567-e89b-12d3-a456-426614174000', '192.168.1.1', 'Google API error');
 */
export const logGoogleUnlinkFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'google unlink failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

/**
 * Логирование успешного восстановления аккаунта
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @example
 * logAccountRestoreSuccess('user@example.com', '123e4567-e89b-12d3-a456-426614174000', '192.168.1.1');
 */
export const logAccountRestoreSuccess = (email, userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'account restore success', `${maskEmail(email)} (${userUuid}) from IP: ${ip}`);
};

/**
 * Логирование неудачной попытки восстановления аккаунта
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина неудачи
 * @example
 * logAccountRestoreFailure('user@example.com', '192.168.1.1', 'Invalid code');
 */
export const logAccountRestoreFailure = (email, ip, reason) => {
  if (!ip) throw new Error('ip is required');
  logWarn('Auth', 'account restore failure', `${maskEmail(email)} from IP: ${ip} - ${reason}`);
};
