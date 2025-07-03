import { logInfo, logWarn, logError, logSuspicious } from './baseLogger.js';

export const logLoginSuccess = (email, userUuid, ip) =>
  logInfo('Auth', 'login success', `${email} (${userUuid}) from IP: ${ip}`);

export const logLoginFailure = (email, ip, reason = 'Invalid credentials') =>
  logWarn('Auth', 'login failure', `${email} from IP: ${ip} - ${reason}`);

export const logLogout = (login, email, userUuid, ip) =>
  logInfo('Auth', 'logout', `${login} (${email}) (${userUuid}) from IP: ${ip}`);

export const logLogoutInvalidToken = (userUuid, ip) =>
  logWarn('Auth', 'logout invalid token', `from IP: ${ip}, user: ${userUuid}`);

export const logTokenRefresh = (userUuid, ip, rotated = false) =>
  logInfo('Auth', 'token refresh', `${userUuid} from IP: ${ip}${rotated ? ' (rotated)' : ''}`);

export const logTokenRefreshFailure = (userUuid, ip, reason) =>
  logWarn('Auth', 'token refresh failure', `${userUuid} from IP: ${ip} - ${reason}`);

export const logRegistrationRequest = (email, ip) =>
  logInfo('Auth', 'registration request', `${email} from IP: ${ip}`);

export const logRegistrationSuccess = (email, userId, ip) =>
  logInfo('Auth', 'registration success', `${email} (${userId}) from IP: ${ip}`);

export const logRegistrationFailure = (email, ip, reason) =>
  logWarn('Auth', 'registration failure', `${email} from IP: ${ip} - ${reason}`);

export const logUserFetch = (userUuid, ip) =>
  logInfo('Auth', 'user fetch', `${userUuid} from IP: ${ip}`);

export const logUserUpdate = (userUuid, changes, ip) =>
  logInfo('Auth', 'user update', `${userUuid} from IP: ${ip}, changes: ${JSON.stringify(changes)}`);

export const logUserUpdateFailure = (userUuid, ip, reason) =>
  logWarn('Auth', 'user update failure', `${userUuid} from IP: ${ip} - ${reason}`);

export const logUserUpdateRequest = (userUuid, email, ip) =>
  logInfo('Auth', 'user update request', `${userUuid} (${email}) from IP: ${ip}`);

export const logUserUpdateRequestFailure = (userUuid, ip, reason) =>
  logWarn('Auth', 'user update request failure', `${userUuid} from IP: ${ip} - ${reason}`);

export const logUserDelete = (userUuid, ip) =>
  logInfo('Auth', 'user delete', `${userUuid} from IP: ${ip}`);

export const logUserDeleteFailure = (userUuid, ip, reason) =>
  logWarn('Auth', 'user delete failure', `${userUuid} from IP: ${ip} - ${reason}`);

export const logUserDeleteRequest = (userUuid, email, ip) =>
  logInfo('Auth', 'user delete request', `${userUuid} (${email}) from IP: ${ip}`);

export const logUserDeleteRequestFailure = (userUuid, ip, reason) =>
  logWarn('Auth', 'user delete request failure', `${userUuid} from IP: ${ip} - ${reason}`);

export const logSuspiciousAuthActivity = (action, identifier, ip, details = '') =>
  logSuspicious('Auth', action, identifier, ip, details); 