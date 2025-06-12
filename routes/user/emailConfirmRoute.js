import { Router } from 'express';
import prisma from '../../utils/prismaClient.js';
import { emailConfirmValidate } from '../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../middlewares/http/validateMiddleware.js';
import {
  getRegistrationData,
  deleteRegistrationData,
} from '../../store/registrationStore.js';
import bcrypt from 'bcrypt';

const router = Router();

router.post(
  '/verify',
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    // console.log('req.body:', req.body);
    const uuid = req.cookies.registration_id;
    // console.log(req.cookies);
    try {
      if (!uuid) {
        return res.status(400).json({ error: 'Регистрация не найдена' });
      }
      const storedData = getRegistrationData(uuid);
      // console.log('storedData:', storedData);

      if (!storedData) {
        return res.status(400).json({ error: 'Код истёк или не найден' });
      }

      const {
        email,
        login,
        hashedPassword,
        confirmationCode: storedCode,
      } = storedData;

      // console.log('storedCode:', storedCode);
      // console.log('confirmationCode:', confirmationCode);
      if (String(storedCode) !== String(confirmationCode)) {
        return res.status(400).json({ error: 'Неверный код' });
      }

      // const hashedPassword = await bcrypt.hash(password, 10);

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
      res.status(500).json({ error: 'Ошибка сервера при регистрации' });
    }
  },
);

export default {
  path: '/',
  router,
};
