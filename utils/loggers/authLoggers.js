
export const logLoginSuccess = (email, userUuid, ipAddress) => {
  console.log(`Login success: ${email} (${userUuid}) from IP: ${ipAddress}`);
};

export const logLoginFailure = (email, ipAddress, reason = 'Invalid credentials') => {
  console.warn(`Login failure: ${email} from IP: ${ipAddress} - ${reason}`);
};

export const logLogout = (login, email, userUuid, ipAddress) => {
  console.log(`User logout: ${login} (${email}) (${userUuid}) from IP: ${ipAddress}`);
};

export const logLogoutInvalidToken = (userUuid, ipAddress) => {
  console.warn(`Logout attempt with invalid token from IP: ${ipAddress}, user: ${userUuid}`);
};

export const logTokenRefresh = (userUuid, ipAddress, rotated = false) => {
  console.log(`Token refresh: ${userUuid} from IP: ${ipAddress}${rotated ? ' (rotated)' : ''}`);
};

export const logTokenRefreshFailure = (userUuid, ipAddress, reason) => {
  console.warn(`Token refresh failure: ${userUuid} from IP: ${ipAddress} - ${reason}`);
};

export const logRegistrationRequest = (email, ipAddress) => {
  console.log(`Registration request: ${email} from IP: ${ipAddress}`);
};

export const logRegistrationSuccess = (email, userId, ipAddress) => {
  console.log(`Registration success: ${email} (${userId}) from IP: ${ipAddress}`);
};

export const logRegistrationFailure = (email, ipAddress, reason) => {
  console.warn(`Registration failure: ${email} from IP: ${ipAddress} - ${reason}`);
};

export const logUserFetch = (userUuid, ipAddress) => {
  console.log(`User data fetched: ${userUuid} from IP: ${ipAddress}`);
};

export const logUserUpdate = (userUuid, changes, ipAddress) => {
  console.log(`User updated: ${userUuid} from IP: ${ipAddress}, changes: ${JSON.stringify(changes)}`);
};

export const logUserUpdateFailure = (userUuid, ipAddress, reason) => {
  console.warn(`User update failure: ${userUuid} from IP: ${ipAddress} - ${reason}`);
};

export const logUserUpdateRequest = (userUuid, email, ipAddress) => {
  console.log(`User update request: ${userUuid} (${email}) from IP: ${ipAddress}`);
};

export const logUserUpdateRequestFailure = (userUuid, ipAddress, reason) => {
  console.warn(`User update request failure: ${userUuid} from IP: ${ipAddress} - ${reason}`);
};

export const logUserDelete = (userUuid, ipAddress) => {
  console.log(`User deleted: ${userUuid} from IP: ${ipAddress}`);
};

export const logUserDeleteFailure = (userUuid, ipAddress, reason) => {
  console.warn(`User delete failure: ${userUuid} from IP: ${ipAddress} - ${reason}`);
};

export const logUserDeleteRequest = (userUuid, email, ipAddress) => {
  console.log(`User delete request: ${userUuid} (${email}) from IP: ${ipAddress}`);
};

export const logUserDeleteRequestFailure = (userUuid, ipAddress, reason) => {
  console.warn(`User delete request failure: ${userUuid} from IP: ${ipAddress} - ${reason}`);
};

export const logSuspiciousAuthActivity = (action, identifier, ipAddress, details = '') => {
  console.warn(`Suspicious auth activity: ${action} by ${identifier} from IP: ${ipAddress} ${details}`);
}; 