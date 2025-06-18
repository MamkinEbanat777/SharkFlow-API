import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { emailConfirmValidate } from '../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../middlewares/http/validateMiddleware.js';
import {
  getRegistrationData,
  deleteRegistrationData,
} from '../../../store/registrationStore.js';

const router = Router();

router.post(
  '/api/users',
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const uuid = req.cookies.sd_f93j8f___;
    try {
      if (!uuid) {
        return res.status(400).json({ error: 'Регистрация не найдена' });
      }

      const storedData = getRegistrationData(uuid);

      if (!storedData) {
        return res.status(400).json({ error: 'Код истёк или не найден' });
      }

      const {
        email,
        login,
        hashedPassword,
        confirmationCode: storedCode,
      } = storedData;

      if (String(storedCode) !== String(confirmationCode)) {
        return res.status(400).json({ error: 'Неверный код' });
      }

      const newUser = await prisma.user.create({
        data: { email, login, password: hashedPassword },
      });

      deleteRegistrationData(uuid);
      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        userId: newUser.id,
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
