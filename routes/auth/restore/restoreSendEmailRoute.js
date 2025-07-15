import { Router } from 'express';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { sendUserConfirmationCode } from '../../../utils/helpers/sendUserConfirmationCode.js';
import { findUserByEmail } from '../../../utils/helpers/userHelpers.js';
import { logAccountRestoreFailure, maskEmail } from '../../../utils/loggers/authLoggers.js';
import { normalizeEmail } from '../../../utils/validators/normalizeEmail.js';
import { generateUUID } from '../../../utils/generators/generateUUID.js';
import { setUserTempData } from '../../../store/userTempData.js';

const router = Router();

router.post('/auth/restore/send', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email)
    const user = await findUserByEmail(normalizedEmail, true);

    if (!user) {
      logAccountRestoreFailure('', req.ip, 'Пользователь не найден');
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await sendUserConfirmationCode({
      userUuid: user.uuid,
      type: 'restoreUser',
      isDeleted: true,
      loggers: {
        success: () => {},
        failure: () => {},
      },
    });

    const restoreKey = generateUUID()

    await setUserTempData('restoreUser', restoreKey, {
        userUuid: user.uuid,
      });
 
    const maskedEmail = maskEmail(user.email)
    
    return res
      .status(200)
      .json({ message: 'Код подтверждения отправлен на вашу почту', restoreKey, maskedEmail });
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
