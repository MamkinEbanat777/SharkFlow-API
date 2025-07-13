import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.TOTP_ENC_KEY, 'hex');

/**
 * Расшифровывает текст, зашифрованный с помощью AES-256-GCM
 * @param {string} data - Зашифрованный текст в формате iv:tag:encrypted
 * @returns {string} Расшифрованный текст
 */
export function decrypt(data) {
  const [ivHex, tagHex, encryptedHex] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    'utf8',
  );
}
