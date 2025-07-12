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

const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '[NO_EMAIL]';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
};

const validateParams = (userUuid, ip) => {
  if (!userUuid) throw new Error('userUuid is required');
  if (!ip) throw new Error('ip is required');
};

export const logLoginSuccess = (email, userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'login success', `${maskEmail(email)} (${userUuid}) from IP: ${ip}`);
};

export const logLoginFailure = (email, ip, reason = 'Invalid credentials') => {
  if (!ip) throw new Error('ip is required');
  logWarn('Auth', 'login failure', `${maskEmail(email)} from IP: ${ip} - ${reason}`);
};

export const logLogout = (login, email, userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'logout', `${login} (${maskEmail(email)}) (${userUuid}) from IP: ${ip}`);
};

export const logLogoutInvalidToken = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logWarn('Auth', 'logout invalid token', `from IP: ${ip}, user: ${userUuid}`);
};

export const logTokenRefresh = (userUuid, ip, rotated = false) => {
  validateParams(userUuid, ip);
  logInfo(
    'Auth',
    'token refresh',
    `${userUuid} from IP: ${ip}${rotated ? ' (rotated)' : ''}`,
  );
};

export const logTokenRefreshFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'token refresh failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

export const logRegistrationRequest = (email, ip) => {
  if (!ip) throw new Error('ip is required');
  logInfo('Auth', 'registration request', `${maskEmail(email)} from IP: ${ip}`);
};

export const logRegistrationSuccess = (email, userId, ip) => {
  if (!userId) throw new Error('userId is required');
  if (!ip) throw new Error('ip is required');
  logInfo(
    'Auth',
    'registration success',
    `${maskEmail(email)} (${userId}) from IP: ${ip}`,
  );
};

export const logRegistrationFailure = (email, ip, reason) => {
  if (!ip) throw new Error('ip is required');
  logWarn(
    'Auth',
    'registration failure',
    `${maskEmail(email)} from IP: ${ip} - ${reason}`,
  );
};

export const logUserFetch = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'user fetch', `${userUuid} from IP: ${ip}`);
};

export const logUserUpdate = (userUuid, changes, ip) => {
  validateParams(userUuid, ip);
  const filteredChanges = filterSensitiveData(changes);
  logInfo(
    'Auth',
    'user update',
    `${userUuid} from IP: ${ip}, changes: ${JSON.stringify(filteredChanges)}`,
  );
};

export const logUserUpdateFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'user update failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

export const logUserUpdateRequest = (userUuid, email, ip) => {
  validateParams(userUuid, ip);
  logInfo(
    'Auth',
    'user update request',
    `${userUuid} (${maskEmail(email)}) from IP: ${ip}`,
  );
};

export const logUserUpdateRequestFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'user update request failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

export const logUserDelete = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'user delete', `${userUuid} from IP: ${ip}`);
};

export const logUserDeleteFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'user delete failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

export const logUserDeleteRequest = (userUuid, email, ip) => {
  validateParams(userUuid, ip);
  logInfo(
    'Auth',
    'user delete request',
    `${userUuid} (${maskEmail(email)}) from IP: ${ip}`,
  );
};

export const logUserDeleteRequestFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'user delete request failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};

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

export const logGoogleUnlinkSuccess = (userUuid, ip) => {
  validateParams(userUuid, ip);
  logInfo('Auth', 'google unlink', `${userUuid} from IP: ${ip}`);
};

export const logGoogleUnlinkFailure = (userUuid, ip, reason) => {
  validateParams(userUuid, ip);
  logWarn(
    'Auth',
    'google unlink failure',
    `${userUuid} from IP: ${ip} - ${reason}`,
  );
};
