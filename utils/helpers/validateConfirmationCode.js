import { getConfirmationCode } from '../../store/userVerifyStore.js';

export async function validateConfirmationCode(userUuid, code, loggers) {
  if (!code?.toString().trim()) {
    loggers?.failure?.(userUuid, 'Confirmation code not provided');
    return false;
  }

  const stored = await getConfirmationCode(userUuid);
  if (!stored || String(stored) !== String(code)) {
    loggers?.failure?.(userUuid, 'Invalid or expired confirmation code');
    return false;
  }

  loggers?.success?.(userUuid);
  return true;
}
