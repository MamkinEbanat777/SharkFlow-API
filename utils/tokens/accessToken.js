/**
 * @module tokens/access
 * @description Функции для работы с access-токенами.
 */
import jwt from 'jsonwebtoken';
import { validateUserRole } from '#utils/validators/enumValidators.js';

export function createAccessToken(userUuid, role = 'user') {
  const roleValidation = validateUserRole(role);
  if (!roleValidation.isValid) {
    throw new Error(`Invalid role in access token: ${roleValidation.error}`);
  }
  
  return jwt.sign({ userUuid, role: roleValidation.value }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    algorithm: 'HS256',
  });
}
