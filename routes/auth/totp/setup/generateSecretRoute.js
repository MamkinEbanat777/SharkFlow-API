import { Router } from 'express';
import { findUserByUuidOrThrow } from '#utils/helpers/userHelpers.js';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import speakeasy from 'speakeasy';
import { encrypt } from '#utils/crypto/encrypt.js';
import { decrypt } from '#utils/crypto/decrypt.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { validateAndDeleteConfirmationCode } from '#utils/helpers/confirmationHelpers.js';
import { createOtpAuthUrl } from '#utils/helpers/totpHelpers.js';
import prisma from '#utils/prismaConfig/prismaClient.js';

const router = Router();

router.post('/auth/totp', authenticateMiddleware, async (req, res) => {
  try {
    const userUuid = req.userUuid;
    const { confirmationCode } = req.body;

    const user = await findUserByUuidOrThrow(userUuid, false, {
      twoFactorPendingSecret: true,
      email: true,
    });

    const validation = await validateAndDeleteConfirmationCode(
      userUuid,
      'setupTotp',
      confirmationCode,
    );

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

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

    const otpauthUrl = createOtpAuthUrl(secret, user.email);

    return res.json({ message: 'Код подтверждения верен', otpauthUrl, secret });
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
