import { Router } from 'express';
import { emailConfirmValidate } from '../../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../../middlewares/http/validateMiddleware.js';
import { deleteConfirmationCode } from '../../../../store/userVerifyStore.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { setEmailConfirmed } from '../../../../store/emailCodeStore.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../../utils/helpers/validateConfirmationCode.js';

const router = Router();

router.post(
  '/api/auth/totp/check-code',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const userUuid = req.userUuid;
    try {
      const valid = await validateConfirmationCode(userUuid, confirmationCode);
      if (!valid) {
        return res
          .status(400)
          .json({ error: 'Неверный или просроченный код подтверждения' });
      }

      deleteConfirmationCode(userUuid);

      setEmailConfirmed(userUuid);

      res.status(200).json({
        message: 'Код подтверждения верен',
      });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при регистрации',
        status: 500,
        message: 'Ошибка при проверке кода подтверждения',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
