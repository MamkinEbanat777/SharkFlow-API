import speakeasy from 'speakeasy';
import { decrypt } from '../crypto/decrypt.js';

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

export const validateTotpCodeFormat = (totpCode) => {
  return /^\d{6}$/.test(totpCode);
};

export const createOtpAuthUrl = (secret, email) => {
  return speakeasy.otpauthURL({
    secret,
    label: `SharkFlow (${email})`,
    encoding: 'base32',
    issuer: 'SharkFlow',
  });
}; 
