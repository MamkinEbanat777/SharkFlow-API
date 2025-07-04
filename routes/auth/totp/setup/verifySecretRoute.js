import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import speakeasy from 'speakeasy';
import { decrypt } from '../../../../utils/crypto/decrypt.js';
import { clearEmailConfirmed } from '../../../../store/emailConfirmedStore.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';

const router = Router();

router.post('/api/auth/totp/setup', authenticateMiddleware, async (req, res) => {
  try {
    const { totpCode } = req.body;
    const userUuid = req.userUuid;

    const user = await prisma.user.findFirst({
      where: { uuid: userUuid, isDeleted: false },
      select: { twoFactorPendingSecret: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (!user.twoFactorPendingSecret) {
      return res.status(400).json({
        error: 'Отсутствует ключ для завершения настройки 2FA',
      });
    }

    const encrypted = user.twoFactorPendingSecret;
    const secret = decrypt(encrypted);
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: totpCode.trim(),
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ error: 'Неверный или просроченный код' });
    }

    await prisma.user.update({
      where: { uuid: userUuid },
      data: {
        twoFactorSecret: user.twoFactorPendingSecret,
        twoFactorPendingSecret: '',
        twoFactorEnabled: true,
      },
    });
    await clearEmailConfirmed('setupTotp', userUuid);
    res.json({ success: true, message: '2FA успешно подключена' });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при подтверждении TOTP',
      status: 500,
      message: 'Ошибка при подтверждении 2FA',
    });
  }
});

export default {
  path: '/',
  router,
};
