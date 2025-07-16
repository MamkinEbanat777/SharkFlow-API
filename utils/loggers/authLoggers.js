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
 * Логирование неудачного получения пользователя
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {Error|string} error - Ошибка
 */
export const logUserFetchFailure = (userUuid, ip, error) => {
  validateParams(userUuid, ip);
  logWarn('Auth', 'user fetch failure', `${userUuid} from IP: ${ip} - ${error?.message || error}`);
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

/**
 * Логгирует попытку входа пользователя
 * @param {string} email
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logLoginAttempt(email, ip, userAgent) {
  logInfo('Auth', 'login_attempt', `[LOGIN_ATTEMPT] email: ${email}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку регистрации пользователя
 * @param {string} email
 * @param {string} ip
 * @param {string} userAgent
 * @param {string} regUuid
 * @param {string} guestUuid
 * @returns {void}
 */
export function logRegistrationAttempt(email, ip, userAgent, regUuid, guestUuid) {
  logInfo(`[REG_ATTEMPT] email: ${email}, ip: ${ip}, ua: ${userAgent}, regUuid: ${regUuid}, guestUuid: ${guestUuid}`);
}

/**
 * Логгирует попытку подтверждения регистрации пользователя
 * @param {string} email
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logRegistrationConfirmAttempt(email, ip, userAgent) {
  logInfo(`[REG_CONFIRM_ATTEMPT] email: ${email}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку обновления пользователя
 * @param {string} userUuid
 * @param {object} dataToUpdate
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logUserUpdateAttempt(userUuid, dataToUpdate, ip, userAgent) {
  logInfo(`[USER_UPDATE_ATTEMPT] uuid: ${userUuid}, data: ${JSON.stringify(dataToUpdate)}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку удаления пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logUserDeleteAttempt(userUuid, ip, userAgent) {
  logInfo(`[USER_DELETE_ATTEMPT] uuid: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку выхода пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @param {string} deviceId
 * @returns {void}
 */
export function logLogoutAttempt(userUuid, ip, userAgent, deviceId) {
  logInfo('Auth', 'logout_attempt', `[LOGOUT_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, deviceId: ${deviceId}`);
}

/**
 * Логгирует попытку обновления refresh токена
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @param {string} deviceId
 * @returns {void}
 */
export function logTokenRefreshAttempt(userUuid, ip, userAgent, deviceId) {
  logInfo('Auth', 'refresh_attempt', `[REFRESH_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, deviceId: ${deviceId}`);
}

/**
 * Логгирует попытку восстановления аккаунта
 * @param {string} restoreKey
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logAccountRestoreAttempt(restoreKey, ip, userAgent) {
  logInfo('Auth', 'restore_attempt', `[RESTORE_ATTEMPT] restoreKey: ${restoreKey}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку верификации TOTP при восстановлении
 * @param {string} restoreKey
 * @param {string} ip
 * @param {string} userAgent
 * @param {string} totpCode
 * @returns {void}
 */
export function logAccountRestoreTotpAttempt(restoreKey, ip, userAgent, totpCode) {
  logInfo('Auth', 'restore_totp_attempt', `[RESTORE_TOTP_ATTEMPT] restoreKey: ${restoreKey}, ip: ${ip}, ua: ${userAgent}, totpCode: ${totpCode}`);
}

/**
 * Логгирует попытку получения данных пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logUserFetchAttempt(userUuid, ip, userAgent) {
  logInfo('User', 'fetch_attempt', `[USER_FETCH_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку обновления аватара пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @param {string} imgUrl
 * @returns {void}
 */
export function logUserAvatarUpdateAttempt(userUuid, ip, userAgent, imgUrl) {
  logInfo('User', 'avatar_update_attempt', `[AVATAR_UPDATE_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, imgUrl: ${imgUrl}`);
}

/**
 * Логгирует попытку удаления аватара пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logUserAvatarDeleteAttempt(userUuid, ip, userAgent) {
  logInfo('User', 'avatar_delete_attempt', `[AVATAR_DELETE_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку запроса на удаление пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logUserDeleteRequestAttempt(userUuid, ip, userAgent) {
  logInfo('User', 'delete_request_attempt', `[DELETE_REQUEST_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку запроса на обновление пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logUserUpdateRequestAttempt(userUuid, ip, userAgent) {
  logInfo('User', 'update_request_attempt', `[UPDATE_REQUEST_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку гостевого входа
 * @param {string} ip - IP адрес клиента
 * @param {string} userAgent - User-Agent клиента
 * @returns {void}
 */
export function logGuestLoginAttempt(ip, userAgent) {
  logInfo('Auth', 'guest_login_attempt', `[GUEST_LOGIN_ATTEMPT] ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку отправки кода восстановления
 * @param {string} email - Email пользователя (будет замаскирован)
 * @param {string} ip - IP адрес клиента
 * @returns {void}
 */
export function logAccountRestoreSendAttempt(email, ip, userAgent) {
  logInfo('Auth', 'restore_send_attempt', `[RESTORE_SEND_ATTEMPT] email: ${maskEmail(email)}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку верификации TOTP
 * @param {string} sessionKey - Ключ сессии 2FA
 * @param {string} totpCode - Введённый TOTP-код
 * @param {string} ip - IP адрес клиента
 * @returns {void}
 */
export function logTotpVerifyAttempt(sessionKey, totpCode, ip, userAgent) {
  logInfo('Auth', 'totp_verify_attempt', `[TOTP_VERIFY_ATTEMPT] sessionKey: ${sessionKey}, totpCode: ${totpCode}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует попытку входа или привязки через GitHub OAuth
 * @param {string} action - 'login' | 'connect' | 'confirm-connect'
 * @param {string} githubId - ID пользователя GitHub
 * @param {string} email - Email пользователя (может быть пустым)
 * @param {string} ip - IP адрес клиента
 * @param {string} userAgent - User-Agent клиента
 */
export function logGithubOAuthAttempt(action, githubId, email, ip, userAgent) {
  logInfo('Auth', 'github_oauth_attempt', `[GITHUB_OAUTH_ATTEMPT] action: ${action}, githubId: ${githubId}, email: ${maskEmail(email)}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует успешный вход или привязку через GitHub OAuth
 * @param {string} action - 'login' | 'connect' | 'confirm-connect'
 * @param {string} githubId - ID пользователя GitHub
 * @param {string} userUuid - UUID пользователя (может быть пустым)
 * @param {string} email - Email пользователя (может быть пустым)
 * @param {string} ip - IP адрес клиента
 */
export function logGithubOAuthSuccess(action, githubId, userUuid, email, ip, ua) {
  logInfo('Auth', 'github_oauth_success', `[GITHUB_OAUTH_SUCCESS] action: ${action}, githubId: ${githubId}, userUuid: ${userUuid}, email: ${maskEmail(email)}, ip: ${ip}, ua: ${ua}`);
}

/**
 * Логгирует ошибку входа или привязки через GitHub OAuth
 * @param {string} action - 'login' | 'connect' | 'confirm-connect'
 * @param {string} githubId - ID пользователя GitHub (может быть пустым)
 * @param {string} email - Email пользователя (может быть пустым)
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина ошибки
 */
export function logGithubOAuthFailure(action, githubId, email, ip, reason, ua) {
  logWarn('Auth', 'github_oauth_failure', `[GITHUB_OAUTH_FAILURE] action: ${action}, githubId: ${githubId}, email: ${maskEmail(email)}, ip: ${ip}, ua: ${ua} , reason: ${reason}`);
}

/**
 * Логгирует попытку входа или привязки через Google OAuth
 * @param {string} action - 'login' | 'connect' | 'confirm-connect'
 * @param {string} googleSub - Google sub/id
 * @param {string} email - Email пользователя (может быть пустым)
 * @param {string} ip - IP адрес клиента
 * @param {string} userAgent - User-Agent клиента
 */
export function logGoogleOAuthAttempt(action, googleSub, email, ip, userAgent) {
  logInfo('Auth', 'google_oauth_attempt', `[GOOGLE_OAUTH_ATTEMPT] action: ${action}, googleSub: ${googleSub}, email: ${maskEmail(email)}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует успешный вход или привязку через Google OAuth
 * @param {string} action - 'login' | 'connect' | 'confirm-connect'
 * @param {string} googleSub - Google sub/id
 * @param {string} userUuid - UUID пользователя (может быть пустым)
 * @param {string} email - Email пользователя (может быть пустым)
 * @param {string} ip - IP адрес клиента
 * @param {string} userAgent - User-Agent клиента
 */
export function logGoogleOAuthSuccess(action, googleSub, userUuid, email, ip, userAgent) {
  logInfo('Auth', 'google_oauth_success', `[GOOGLE_OAUTH_SUCCESS] action: ${action}, googleSub: ${googleSub}, userUuid: ${userUuid}, email: ${maskEmail(email)}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует ошибку входа или привязки через Google OAuth
 * @param {string} action - 'login' | 'connect' | 'confirm-connect'
 * @param {string} googleSub - Google sub/id (может быть пустым)
 * @param {string} email - Email пользователя (может быть пустым)
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина ошибки
 * @param {string} userAgent - User-Agent клиента
 */
export function logGoogleOAuthFailure(action, googleSub, email, ip, reason, userAgent) {
  logWarn('Auth', 'google_oauth_failure', `[GOOGLE_OAUTH_FAILURE] action: ${action}, googleSub: ${googleSub}, email: ${maskEmail(email)}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку входа или привязки через Yandex OAuth
 * @param {string} action - 'login' | 'connect' | 'confirm-connect'
 * @param {string} yandexId - Yandex id
 * @param {string} email - Email пользователя (может быть пустым)
 * @param {string} ip - IP адрес клиента
 * @param {string} userAgent - User-Agent клиента
 */
export function logYandexOAuthAttempt(action, yandexId, email, ip, userAgent) {
  logInfo('Auth', 'yandex_oauth_attempt', `[YANDEX_OAUTH_ATTEMPT] action: ${action}, yandexId: ${yandexId}, email: ${maskEmail(email)}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует успешный вход или привязку через Yandex OAuth
 * @param {string} action - 'login' | 'connect' | 'confirm-connect'
 * @param {string} yandexId - Yandex id
 * @param {string} userUuid - UUID пользователя (может быть пустым)
 * @param {string} email - Email пользователя (может быть пустым)
 * @param {string} ip - IP адрес клиента
 * @param {string} userAgent - User-Agent клиента
 */
export function logYandexOAuthSuccess(action, yandexId, userUuid, email, ip, userAgent) {
  logInfo('Auth', 'yandex_oauth_success', `[YANDEX_OAUTH_SUCCESS] action: ${action}, yandexId: ${yandexId}, userUuid: ${userUuid}, email: ${maskEmail(email)}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует ошибку входа или привязки через Yandex OAuth
 * @param {string} action - 'login' | 'connect' | 'confirm-connect'
 * @param {string} yandexId - Yandex id (может быть пустым)
 * @param {string} email - Email пользователя (может быть пустым)
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина ошибки
 * @param {string} userAgent - User-Agent клиента
 */
export function logYandexOAuthFailure(action, yandexId, email, ip, reason, userAgent) {
  logWarn('Auth', 'yandex_oauth_failure', `[YANDEX_OAUTH_FAILURE] action: ${action}, yandexId: ${yandexId}, email: ${maskEmail(email)}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку отвязки Google OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logGoogleOAuthDisableAttempt(userUuid, ip, userAgent) {
  logInfo('Auth', 'google_oauth_disable_attempt', `[GOOGLE_OAUTH_DISABLE_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует успешную отвязку Google OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logGoogleOAuthDisableSuccess(userUuid, ip, userAgent) {
  logInfo('Auth', 'google_oauth_disable_success', `[GOOGLE_OAUTH_DISABLE_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует ошибку отвязки Google OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 * @param {string} userAgent
 */
export function logGoogleOAuthDisableFailure(userUuid, ip, reason, userAgent) {
  logWarn('Auth', 'google_oauth_disable_failure', `[GOOGLE_OAUTH_DISABLE_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку отвязки GitHub OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logGithubOAuthDisableAttempt(userUuid, ip, userAgent) {
  logInfo('Auth', 'github_oauth_disable_attempt', `[GITHUB_OAUTH_DISABLE_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует успешную отвязку GitHub OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logGithubOAuthDisableSuccess(userUuid, ip, userAgent) {
  logInfo('Auth', 'github_oauth_disable_success', `[GITHUB_OAUTH_DISABLE_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует ошибку отвязки GitHub OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 * @param {string} userAgent
 */
export function logGithubOAuthDisableFailure(userUuid, ip, reason, userAgent) {
  logWarn('Auth', 'github_oauth_disable_failure', `[GITHUB_OAUTH_DISABLE_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку отвязки Yandex OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logYandexOAuthDisableAttempt(userUuid, ip, userAgent) {
  logInfo('Auth', 'yandex_oauth_disable_attempt', `[YANDEX_OAUTH_DISABLE_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует успешную отвязку Yandex OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logYandexOAuthDisableSuccess(userUuid, ip, userAgent) {
  logInfo('Auth', 'yandex_oauth_disable_success', `[YANDEX_OAUTH_DISABLE_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует ошибку отвязки Yandex OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 * @param {string} userAgent
 */
export function logYandexOAuthDisableFailure(userUuid, ip, reason, userAgent) {
  logWarn('Auth', 'yandex_oauth_disable_failure', `[YANDEX_OAUTH_DISABLE_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку подтверждения привязки Google OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logGoogleOAuthConfirmAttempt(userUuid, ip, userAgent) {
  logInfo('Auth', 'google_oauth_confirm_attempt', `[GOOGLE_OAUTH_CONFIRM_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует успешное подтверждение привязки Google OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logGoogleOAuthConfirmSuccess(userUuid, ip, userAgent) {
  logInfo('Auth', 'google_oauth_confirm_success', `[GOOGLE_OAUTH_CONFIRM_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует ошибку подтверждения привязки Google OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 * @param {string} userAgent
 */
export function logGoogleOAuthConfirmFailure(userUuid, ip, reason, userAgent) {
  logWarn('Auth', 'google_oauth_confirm_failure', `[GOOGLE_OAUTH_CONFIRM_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку подтверждения привязки GitHub OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logGithubOAuthConfirmAttempt(userUuid, ip, userAgent) {
  logInfo('Auth', 'github_oauth_confirm_attempt', `[GITHUB_OAUTH_CONFIRM_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует успешное подтверждение привязки GitHub OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logGithubOAuthConfirmSuccess(userUuid, ip, userAgent) {
  logInfo('Auth', 'github_oauth_confirm_success', `[GITHUB_OAUTH_CONFIRM_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует ошибку подтверждения привязки GitHub OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 * @param {string} userAgent
 */
export function logGithubOAuthConfirmFailure(userUuid, ip, reason, userAgent) {
  logWarn('Auth', 'github_oauth_confirm_failure', `[GITHUB_OAUTH_CONFIRM_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку подтверждения привязки Yandex OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logYandexOAuthConfirmAttempt(userUuid, ip, userAgent) {
  logInfo('Auth', 'yandex_oauth_confirm_attempt', `[YANDEX_OAUTH_CONFIRM_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует успешное подтверждение привязки Yandex OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logYandexOAuthConfirmSuccess(userUuid, ip, userAgent) {
  logInfo('Auth', 'yandex_oauth_confirm_success', `[YANDEX_OAUTH_CONFIRM_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует ошибку подтверждения привязки Yandex OAuth
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 * @param {string} userAgent
 */
export function logYandexOAuthConfirmFailure(userUuid, ip, reason, userAgent) {
  logWarn('Auth', 'yandex_oauth_confirm_failure', `[YANDEX_OAUTH_CONFIRM_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку настройки TOTP (2FA)
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logTotpSetupAttempt(userUuid, ip, userAgent) {
  logInfo('Auth', 'totp_setup_attempt', `[TOTP_SETUP_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует успешную настройку TOTP (2FA)
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logTotpSetupSuccess(userUuid, ip, userAgent) {
  logInfo('Auth', 'totp_setup_success', `[TOTP_SETUP_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}
/**
 * Логгирует ошибку настройки TOTP (2FA)
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 * @param {string} userAgent
 */
export function logTotpSetupFailure(userUuid, ip, reason, userAgent) {
  logWarn('Auth', 'totp_setup_failure', `[TOTP_SETUP_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует неудачную попытку выхода пользователя с устройства
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {string} reason - Причина неудачи
 * @param {string} userAgent - User-Agent клиента
 * @param {string} deviceId - ID устройства
 * @returns {void}
 */
export function logLogoutFailure(userUuid, ip, reason, userAgent, deviceId) {
  logWarn(
    'Auth',
    'logout_failure',
    `[LOGOUT_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, deviceId: ${deviceId}, reason: ${reason}`
  );
}

/**
 * Логгирует успешное обновление аватара пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @param {string} imgUrl
 * @returns {void}
 */
export function logUserAvatarUpdateSuccess(userUuid, ip, userAgent, imgUrl) {
  logInfo('User', 'avatar_update_success', `[AVATAR_UPDATE_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, imgUrl: ${imgUrl}`);
}

/**
 * Логгирует неудачное обновление аватара пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 * @param {string} userAgent
 * @param {string} imgUrl
 * @returns {void}
 */
export function logUserAvatarUpdateFailure(userUuid, ip, reason, userAgent, imgUrl) {
  logWarn('User', 'avatar_update_failure', `[AVATAR_UPDATE_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, imgUrl: ${imgUrl}, reason: ${reason}`);
}

/**
 * Логгирует успешное удаление аватара пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 * @returns {void}
 */
export function logUserAvatarDeleteSuccess(userUuid, ip, userAgent) {
  logInfo('User', 'avatar_delete_success', `[AVATAR_DELETE_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует неудачное удаление аватара пользователя
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 * @param {string} userAgent
 * @returns {void}
 */
export function logUserAvatarDeleteFailure(userUuid, ip, reason, userAgent) {
  logWarn('User', 'avatar_delete_failure', `[AVATAR_DELETE_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку отключения TOTP (2FA)
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logTotpDisableAttempt(userUuid, ip, userAgent) {
  logInfo('Auth', 'totp_disable_attempt', `[TOTP_DISABLE_ATTEMPT] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует успешное отключение TOTP (2FA)
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} userAgent
 */
export function logTotpDisableSuccess(userUuid, ip, userAgent) {
  logInfo('Auth', 'totp_disable_success', `[TOTP_DISABLE_SUCCESS] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}`);
}

/**
 * Логгирует ошибку отключения TOTP (2FA)
 * @param {string} userUuid
 * @param {string} reason
 * @param {string} ip
 * @param {string} userAgent
 */
export function logTotpDisableFailure(userUuid, reason, ip, userAgent) {
  logWarn('Auth', 'totp_disable_failure', `[TOTP_DISABLE_FAILURE] user: ${userUuid}, ip: ${ip}, ua: ${userAgent}, reason: ${reason}`);
}

/**
 * Логгирует попытку получения Cloudinary signature
 * @param {string} userUuid
 * @param {string} ip
 */
export function logCloudinarySignatureAttempt(userUuid, ip) {
  logInfo('Cloudinary', 'signature_attempt', `[CLOUDINARY_SIGNATURE_ATTEMPT] user: ${userUuid}, ip: ${ip}`);
}
/**
 * Логгирует успешную выдачу Cloudinary signature
 * @param {string} userUuid
 * @param {string} ip
 */
export function logCloudinarySignatureSuccess(userUuid, ip) {
  logInfo('Cloudinary', 'signature_success', `[CLOUDINARY_SIGNATURE_SUCCESS] user: ${userUuid}, ip: ${ip}`);
}
/**
 * Логгирует ошибку при получении Cloudinary signature
 * @param {string} userUuid
 * @param {string} ip
 * @param {string} reason
 */
export function logCloudinarySignatureFailure(userUuid, ip, reason) {
  logWarn('Cloudinary', 'signature_failure', `[CLOUDINARY_SIGNATURE_FAILURE] user: ${userUuid}, ip: ${ip}, reason: ${reason}`);
}

/**
 * Логирование неудачного получения задач
 * @param {string} boardUuid - UUID доски
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {Error|string} error - Ошибка
 */
export const logTaskFetchFailure = (boardUuid, userUuid, ip, error) => {
  logWarn('Task', 'fetch failure', `board: ${boardUuid}, user: ${userUuid}, ip: ${ip} - ${error?.message || error}`);
};

/**
 * Логирование неудачного создания задачи
 * @param {string} title - Название задачи
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {Error|string} error - Ошибка
 */
export const logTaskCreationFailure = (title, userUuid, ip, error) => {
  logWarn('Task', 'creation failure', `title: ${title}, user: ${userUuid}, ip: ${ip} - ${error?.message || error}`);
};

/**
 * Логирование неудачного получения досок
 * @param {string} userUuid - UUID пользователя
 * @param {string} ip - IP адрес клиента
 * @param {Error|string} error - Ошибка
 */
export const logBoardFetchFailure = (userUuid, ip, error) => {
  validateParams(userUuid, ip);
  logWarn('Board', 'fetch failure', `${userUuid} from IP: ${ip} - ${error?.message || error}`);
};
