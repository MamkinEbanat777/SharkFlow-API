import { Router } from 'express';
import { findUserByUuid } from '../../../../utils/helpers/userHelpers.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { clearEmailConfirmed } from '../../../../store/emailConfirmedStore.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { verifyTotpCode } from '../../../../utils/helpers/totpHelpers.js';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';

const router = Router();

router.post('/api/auth/totp/setup', authenticateMiddleware, async (req, res) => {
  try {
    const { totpCode } = req.body;
    const userUuid = req.userUuid;

    const user = await findUserByUuid(userUuid, { twoFactorPendingSecret: true });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (!user.twoFactorPendingSecret) {
      return res.status(400).json({
        error: 'Отсутствует ключ для завершения настройки 2FA',
      });
    }

    if (!verifyTotpCode({ twoFactorSecret: user.twoFactorPendingSecret }, totpCode)) {
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
