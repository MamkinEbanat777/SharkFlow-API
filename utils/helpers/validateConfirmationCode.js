import {
  getConfirmationCode,
  isConfirmationBlocked,
  registerFailedAttempt,
  resetConfirmationAttempts,
} from '../../store/userVerifyStore.js';
import { isValidUUID } from '../validators/taskValidators.js';

/**
 * Валидация кода подтверждения с защитой от брутфорса
 * @param {string} userUuid - UUID пользователя
 * @param {string} type - Тип подтверждения (email, totp, etc.)
 * @param {string} code - Код подтверждения
 * @param {Object} loggers - Объект с логгерами для логирования
 * @returns {Promise<boolean>} true если код валиден
 * @example
 * const isValid = await validateConfirmationCode(userUuid, 'email', '123456', loggers);
 */
export async function validateConfirmationCode(userUuid, type, code, loggers) {
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }

  if (!code?.toString().trim()) {
    loggers?.failure?.(userUuid, 'Confirmation code not provided');
    return false;
  }
  const blocked = await isConfirmationBlocked(type, userUuid);
  if (blocked) {
    loggers?.failure?.(
      userUuid,
      'Too many failed attempts, temporarily blocked',
    );
    return false;
  }

  const stored = await getConfirmationCode(type, userUuid);

  if (!stored || String(stored) !== String(code)) {
    await registerFailedAttempt(type, userUuid);
    loggers?.failure?.(userUuid, 'Invalid or expired confirmation code');
    return false;
  }

  await resetConfirmationAttempts(type, userUuid);
  loggers?.success?.(userUuid);
  return true;
}
