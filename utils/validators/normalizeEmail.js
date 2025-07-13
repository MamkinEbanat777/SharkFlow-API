/**
 * @module validators/normalizeEmail
 * @description Валидаторы для нормализации email адресов.
 */
/**
 * Проверяет, является ли email валидным
 * @param {string} email - Email для проверки
 * @returns {boolean} true, если email валиден
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Приводит email к нижнему регистру и проверяет валидность
 * @param {string} email - Email для нормализации
 * @returns {string|null} Нормализованный email или null, если невалиден
 */
export function normalizeEmail(email) {
  if (typeof email === 'string' && email.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return null;
    }
    return normalizedEmail;
  }
  return null;
}
