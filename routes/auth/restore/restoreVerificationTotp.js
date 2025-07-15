import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { findUserByUuidOrThrow } from '../../../utils/helpers/userHelpers.js';
import { verifyTotpCode } from '../../../utils/helpers/totpHelpers.js';
import { deleteUserTempData } from '../../../store/userTempData.js';
import { deleteConfirmationCode } from '../../../store/userVerifyStore.js';
import { validateTotpCodeFormat } from '../../../utils/helpers/totpHelpers.js';
import { getUserTempData } from '../../../store/userTempData.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { logAccountRestoreSuccess, logAccountRestoreFailure } from '../../../utils/loggers/authLoggers.js';

const router = Router();

router.post('/auth/restore/verify/totp', async (req, res) => {
  const { totpCode, restoreKey } = req.body;

  console.log('totpsdadsa', totpCode, restoreKey);

  try {
    const session = await getUserTempData('twoFactorAuth', restoreKey);
    if (!session) {
      logAccountRestoreFailure('', req.ip, 'Сессия 2FA истекла или не найдена');
      return res
        .status(401)
        .json({ error: 'Сессия 2FA истекла или не найдена' });
    }

    if (!validateTotpCodeFormat(totpCode)) {
      logAccountRestoreFailure('', req.ip, 'Код TOTP неверного формата');
      return res.status(400).json({ error: 'Код должен состоять из 6 цифр' });
    }

    const { uuid, twoFactorEnabled, ipAddress, userAgent, timestamp } = session;

    const user = await findUserByUuidOrThrow(uuid, true, {
      id: true,
      uuid: true,
      password: true,
      login: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      twoFactorSecret: true,
    });

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      logAccountRestoreFailure(user.email, req.ip, '2FA не настроена для пользователя');
      return res
        .status(400)
        .json({ error: '2FA не настроена для пользователя' });
    }

    if (!verifyTotpCode(user, totpCode)) {
      logAccountRestoreFailure(user.email, req.ip, 'Неверный или просроченный код TOTP');
      return res.status(403).json({ error: 'Неверный или просроченный код' });
    }

    await prisma.user.update({
      where: { uuid: user.uuid },
      data: {
        isDeleted: false,
      },
    });
    logAccountRestoreSuccess(user.email, user.uuid, req.ip);

    await deleteUserTempData('restoreUser', restoreKey);

    await deleteConfirmationCode('restoreUser', user.uuid);

    await deleteUserTempData('twoFactorAuth', restoreKey);

    return res
      .status(200)
      .json({ message: 'Верификация успешна, аккаунт восстановлен' });
  } catch (error) {
    handleRouteError(res, error, {
      message: 'Ошибка при логине. Попробуйте позже',
      status: 500,
      logPrefix: 'Ошибка при логине',
    });
  }
});

export default {
  path: '/',
  router,
};
