import { Router } from 'express';
import { registerValidate } from '../../utils/validators/registerValidate.js';
import { validateMiddleware } from '../../middlewares/http/validateMiddleware.js';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { setRegistrationData } from '../../store/registrationStore.js';
import bcrypt from 'bcrypt';
import { getRegistrationCookieOptions } from '../../utils/cookie/registerCookie.js';
import { generateUUID } from '../../utils/generators/generateUUID.js';
import { generateConfirmationCode } from '../../utils/generators/generateConfirmationCode.js';
import { sendConfirmationEmail } from '../../utils/mail/sendConfirmationEmail.js';
import { normalizeUserData } from '../../utils/validators/normalizeLoginAndEmail.js';

const router = Router();

router.post(
  '/register',
  validateMiddleware(registerValidate),
  async (req, res) => {
    const { user } = req.validatedBody;
    const { email, login, password } = user;

    const normalizedData = normalizeUserData({ email, login });

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: normalizedData.email, mode: 'insensitive' } },
            { login: { equals: normalizedData.login, mode: 'insensitive' } },
          ],
        },
      });

      if (existingUser) {
        return res.status(409).json({
          error:
            existingUser.login.toLowerCase() ===
            normalizedData.login.toLowerCase()
              ? 'Логин уже занят'
              : 'Пользователь с таким email уже существует',
        });
      }

      const uuid = generateUUID();
      const confirmationCode = generateConfirmationCode();

      const hashedPassword = await bcrypt.hash(password, 10);

      setRegistrationData(uuid, {
        email: normalizedData.email,
        login: normalizedData.login,
        hashedPassword,
        confirmationCode,
      });

      await sendConfirmationEmail({
        to: normalizedData.email,
        type: 'registration',
        confirmationCode,
      });

      console.log(`Код подтверждения отправлен на ${email}`);

      res.cookie('sd_f93j8f___', uuid, getRegistrationCookieOptions());

      res
        .status(200)
        .json({ message: 'Код подтверждения отправлен на вашу почту' });
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
