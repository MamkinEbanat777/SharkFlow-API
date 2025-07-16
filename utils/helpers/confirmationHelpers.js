/**
 * @module helpers/confirmation
 * @description Вспомогательные функции для работы с кодами подтверждения.
 */
import { validateConfirmationCode } from './validateConfirmationCode.js';
import { deleteConfirmationCode } from '#store/userVerifyStore.js';
import { isValidUUID } from '#utils/validators/taskValidators.js';

/**
 * Валидация кода подтверждения с последующим удалением
 * @param {string} userUuid - UUID пользователя
 * @param {string} type - Тип подтверждения (email, totp, etc.)
 * @param {string} confirmationCode - Код подтверждения
 * @param {string} errorMessage - Кастомное сообщение об ошибке
 * @returns {Promise<Object>} Результат валидации {isValid: boolean, error?: string}
 * @example
 * const result = await validateAndDeleteConfirmationCode(userUuid, 'email', '123456');
 * if (!result.isValid) {
 *   throw new Error(result.error);
 * }
 */
export const validateAndDeleteConfirmationCode = async (
  userUuid,
  type,
  confirmationCode,
  errorMessage = 'Неверный или просроченный код подтверждения',
) => {
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }

  const valid = await validateConfirmationCode(
    userUuid,
    type,
    confirmationCode,
  );

  if (!valid) {
    return { isValid: false, error: errorMessage };
  }

  await deleteConfirmationCode(type, userUuid);
  return { isValid: true };
};

/**
 * Валидация кода подтверждения с кастомной ошибкой
 * @param {string} userUuid - UUID пользователя
 * @param {string} type - Тип подтверждения (email, totp, etc.)
 * @param {string} confirmationCode - Код подтверждения
 * @param {string|null} customError - Кастомное сообщение об ошибке (опционально)
 * @returns {Promise<Object>} Результат валидации {isValid: boolean, error?: string}
 * @example
 * const result = await validateConfirmationCodeWithCustomError(userUuid, 'totp', '123456', 'Неверный TOTP код');
 * if (!result.isValid) {
 *   throw new Error(result.error);
 * }
 */
export const validateConfirmationCodeWithCustomError = async (
  userUuid,
  type,
  confirmationCode,
  customError = null,
) => {
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }

  const valid = await validateConfirmationCode(
    userUuid,
    type,
    confirmationCode,
  );

  if (!valid) {
    return {
      isValid: false,
      error: customError || 'Неверный или просроченный код подтверждения',
    };
  }

  return { isValid: true };
};
