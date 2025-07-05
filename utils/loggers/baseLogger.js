export const logInfo = (entity, action, details) =>
  console.log(`[${entity}] ${action}: ${details}`);

export const logWarn = (entity, action, details) =>
  console.warn(`[${entity}] ${action}: ${details}`);

export const logError = (entity, action, details, error) =>
  console.error(`[${entity}] ${action}: ${details}`, error);

export const logSuspicious = (entity, action, userUuid, ip, extra = '') =>
  console.warn(`[${entity}] Suspicious: ${action} by ${userUuid} from IP: ${ip} ${extra}`); 
