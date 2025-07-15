import { Router } from 'express';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { sendUserConfirmationCode } from '../../../utils/helpers/sendUserConfirmationCode.js';
import { getUserTempData } from '../../../store/userTempData.js';
import { findUserByUuidOrThrow } from '../../../utils/helpers/userHelpers.js';
import { logAccountRestoreFailure } from '../../../utils/loggers/authLoggers.js';

const router = Router();

router.post('/auth/restore/confirm', async (req, res) => {
  try {
    const { restoreKey } = req.body;

    const storedData = await getUserTempData('restoreUser', restoreKey);
    if (!storedData) {
      logAccountRestoreFailure('', req.ip, 'restoreKey истёк или не найден');
      return res.status(400).json({ error: 'Код истёк или не найден' });
    }

    const { userUuid } = storedData;

    const user = await findUserByUuidOrThrow(userUuid, true);

    const email = user.email;
    if (!email) {
      logAccountRestoreFailure('', req.ip, 'Email пользователя отсутствует');
      return res.status(400).json({ error: 'Email пользователя отсутствует' });
    }

    await sendUserConfirmationCode({
      userUuid,
      type: 'restoreUser',
      isDeleted: true,
      loggers: {
        success: () => {},
        failure: () => {},
      },
    });

    return res
      .status(200)
      .json({ message: 'Код подтверждения отправлен на вашу почту' });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при отправке кода',
      status: 500,
      message: 'Ошибка при отправке кода подтверждения',
    });
  }
});

export default {
  path: '/',
  router,
};
