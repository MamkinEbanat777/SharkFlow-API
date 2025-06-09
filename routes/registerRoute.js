import { Router } from 'express';
import { registerValidate } from '../utils/validators/registerValidate.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import prisma from '../utils/prismaClient.js';
import { sendEmail } from '../utils/mailer.js';
import { renderEmail } from '../utils/emailRenderer.js';
import { v4 as uuidv4 } from 'uuid';
import { setRegistrationData } from '../store/registrationStore.js';

const router = Router();

router.post(
  '/register',
  validateMiddleware(registerValidate),
  async (req, res) => {
    const { user } = req.validatedBody;
    const { email, login, password } = user;

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }],
        },
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'Пользователь уже существует',
        });
      }

      const confirmationCode = Math.floor(100000 + Math.random() * 900000);
      const uuid = uuidv4();

      setRegistrationData(uuid, { email, login, password, confirmationCode });

      const html = await renderEmail('registration', {
        title: 'Добро пожаловать в TaskFlow!',
        confirmationCode,
      });

      sendEmail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Добро пожаловать в TaskFlow!',
        html,
      }).catch((error) => {
        console.error('Ошибка при отправке письма:', error);
      });

      res.cookie('registration_id', uuid, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 900000,
        path: '/',
      });

      // console.log('Set-Cookie:', res.getHeader('Set-Cookie'));

      res.status(200).json({ message: 'Код подтверждения отправлен' });
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
