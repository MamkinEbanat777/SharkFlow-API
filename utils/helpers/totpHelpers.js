/**
 * @module helpers/totp
 * @description Вспомогательные функции для работы с TOTP (Time-based One-Time Password).
 */
import speakeasy from 'speakeasy';
import { decrypt } from '../crypto/decrypt.js';

/**
 * Верификация TOTP кода пользователя
 * @param {Object} user - Объект пользователя с twoFactorSecret
 * @param {string} totpCode - TOTP код от пользователя
 * @returns {boolean} true если код валиден
 * @example
 * const isValid = verifyTotpCode(user, '123456');
 */
export const verifyTotpCode = (user, totpCode) => {
  if (!user.twoFactorSecret) {
    return false;
  }

  const decryptedSecret = decrypt(user.twoFactorSecret);
  
  return speakeasy.totp.verify({
    secret: decryptedSecret,
    encoding: 'base32',
    token: totpCode.trim(),
    window: 1,
  });
};

/**
 * Валидация формата TOTP кода
 * @param {string} totpCode - TOTP код для проверки
 * @returns {boolean} true если код соответствует формату (6 цифр)
 * @example
 * const isValidFormat = validateTotpCodeFormat('123456'); // true
 * const isValidFormat = validateTotpCodeFormat('12345'); // false
 */
export const validateTotpCodeFormat = (totpCode) => {
  return /^\d{6}$/.test(totpCode);
};

/**
 * Создание URL для QR-кода TOTP
 * @param {string} secret - Секретный ключ
 * @param {string} email - Email пользователя
 * @returns {string} URL для генерации QR-кода
 * @example
 * const qrUrl = createOtpAuthUrl(secret, 'user@example.com');
 */
export const createOtpAuthUrl = (secret, email) => {
  return speakeasy.otpauthURL({
    secret,
    label: `SharkFlow (${email})`,
    encoding: 'base32',
    issuer: 'SharkFlow',
  });
}; 
