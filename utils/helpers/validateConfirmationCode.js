import { getConfirmationCode } from '../../store/userVerifyStore.js';

export function validateConfirmationCode(userUuid, code, loggers) {
  const stored = getConfirmationCode(userUuid);
  if (!stored || String(stored) !== String(code)) {
    loggers?.failure?.(userUuid, 'Invalid or expired confirmation code');
    return false;
  }
  loggers?.success?.(userUuid);
  return true;
} 