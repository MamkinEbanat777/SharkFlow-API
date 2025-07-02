import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { encrypt } from '../../../../utils/crypto/encrypt.js';
import { decrypt } from '../../../../utils/crypto/decrypt.js';
import { isEmailConfirmed } from '../../../../store/emailCodeStore.js';

const router = Router();

router.get('/api/auth/totp', authenticateMiddleware, async (req, res) => {
  try {
    const userUuid = req.userUuid;
    if (!isEmailConfirmed(userUuid)) {
      return res.status(403).json({ error: 'Код подтверждения не пройден' });
    }
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid, isDeleted: false },
      select: { twoFactorPendingSecret: true, email: true },
    });

    let secret = user.twoFactorPendingSecret;
    if (!secret) {
      const generated = speakeasy.generateSecret({
        length: 20,
        name: `SharkFlow (${user.email})`,
      });
      secret = generated.base32;
      await prisma.user.update({
        where: { uuid: userUuid },
        data: { twoFactorPendingSecret: encrypt(secret) },
      });
    } else {
      secret = decrypt(user.twoFactorPendingSecret);
    }

    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: `SharkFlow (${user.email})`,
      encoding: 'base32',
      issuer: 'SharkFlow',
    });

    res.json({ otpauthUrl, secret });
  } catch (error) {
    console.error('Error generating or fetching TOTP secret:', error);
    res.status(500).json({ error: 'Ошибка при генерации 2FA' });
  }
});

export default {
  path: '/',
  router,
};
