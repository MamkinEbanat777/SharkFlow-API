import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.TOTP_ENC_KEY, 'hex');

/**
 * Шифрует текст с использованием AES-256-GCM
 * @param {string} text - Текст для шифрования
 * @returns {string} Зашифрованный текст в формате iv:tag:encrypted
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return (
    iv.toString('hex') +
    ':' +
    tag.toString('hex') +
    ':' +
    encrypted.toString('hex')
  );
}
