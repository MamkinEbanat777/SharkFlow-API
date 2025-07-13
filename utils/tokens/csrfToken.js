/**
 * @module tokens/csrf
 * @description Функции для работы с CSRF-токенами.
 */
import jwt from 'jsonwebtoken';
import { validateUserRole } from '../validators/enumValidators.js';

export function createCsrfToken(userUuid, role = 'user') {
  const roleValidation = validateUserRole(role);
  if (!roleValidation.isValid) {
    throw new Error(`Invalid role in CSRF token: ${roleValidation.error}`);
  }
  
  return jwt.sign({ userUuid, role: roleValidation.value }, process.env.JWT_CSRF_SECRET, {
    expiresIn: process.env.JWT_CSRF_EXPIRES || '15m',
    algorithm: 'HS256',
  });
}
