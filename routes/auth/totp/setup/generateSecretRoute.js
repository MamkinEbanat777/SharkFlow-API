import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import speakeasy from 'speakeasy';
import { encrypt } from '../../../../utils/crypto/encrypt.js';
import { decrypt } from '../../../../utils/crypto/decrypt.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { deleteConfirmationCode } from '../../../../store/userVerifyStore.js';
import { validateConfirmationCode } from '../../../../utils/helpers/validateConfirmationCode.js';

const router = Router();

router.post('/api/auth/totp', authenticateMiddleware, async (req, res) => {
  try {
    const userUuid = req.userUuid;
    const { confirmationCode } = req.body;
    const user = await prisma.user.findFirst({
      where: { uuid: userUuid, isDeleted: false },
      select: { twoFactorPendingSecret: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const valid = await validateConfirmationCode(
      userUuid,
      'setupTotp',
      confirmationCode,
    );
    if (!valid) {
      return res
        .status(400)
        .json({ error: 'Неверный или просроченный код подтверждения' });
    }

    await deleteConfirmationCode('setupTotp', userUuid);

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

    res.json({ message: 'Код подтверждения верен', otpauthUrl, secret });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка генерации или получения TOTP secret',
      status: 500,
      message: 'Ошибка при генерации 2FA',
    });
  }
});

export default {
  path: '/',
  router,
};
