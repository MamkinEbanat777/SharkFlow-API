import { Router } from 'express';
import { emailConfirmValidate } from '../../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../../middlewares/http/validateMiddleware.js';
import { getConfirmationCode } from '../../../../store/userVerifyStore.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { setEmailConfirmed } from '../../../../store/emailCodeStore.js';

const router = Router();

router.post(
  '/api/auth/totp/check-code',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const userUuid = req.userUuid;
    try {
      const storedCode = getConfirmationCode(userUuid);
      console.log(storedCode);
      if (String(storedCode) !== String(confirmationCode)) {
        return res.status(400).json({ error: 'Неверный код' });
      }

      if (confirmationCode.length === 6) {
        setEmailConfirmed(userUuid);
      }

      res.status(201).json({
        message: 'Код подтверждения верен',
      });
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      res
        .status(500)
        .json({ error: 'Ошибка сервера. Пожалуйста, повторите попытку позже' });
    }
  },
);

export default {
  path: '/',
  router,
};
