/**
 * @module generators/confirmationCode
 * @description Генераторы кодов подтверждения.
 */
/**
 * Генерирует 6-значный код подтверждения
 * @returns {string} Код подтверждения от 100000 до 999999
 */
export function generateConfirmationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
