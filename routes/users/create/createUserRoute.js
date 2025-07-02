import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { emailConfirmValidate } from '../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../middlewares/http/validateMiddleware.js';
import {
  getRegistrationData,
  deleteRegistrationData,
} from '../../../store/registrationStore.js';
import {
  logRegistrationSuccess,
  logRegistrationFailure,
} from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';

const router = Router();

router.post(
  '/api/users',
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const { confirmationCode } = req.body;
    const regUuid = req.cookies.sd_f93j8f___;
    const guestUuid = req.cookies.log___sf_21s_t1;
    const ipAddress = getClientIP(req);

    try {
      if (!regUuid) {
        return res.status(400).json({ error: 'Регистрация не найдена' });
      }

      const storedData = getRegistrationData(regUuid);
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
        logRegistrationFailure(email, ipAddress, 'Invalid confirmation code');
        return res.status(400).json({ error: 'Неверный код' });
      }

      let userRecord;

      if (guestUuid) {
        const existingGuest = await prisma.user.findUnique({
          where: { uuid: guestUuid },
        });

        if (existingGuest && existingGuest.role === 'guest') {
          userRecord = await prisma.user.update({
            where: { uuid: guestUuid },
            data: {
              email,
              login,
              password: hashedPassword,
              role: 'user',
            },
          });
        }
      }

      if (!userRecord) {
        userRecord = await prisma.user.create({
          data: {
            email,
            login,
            password: hashedPassword,
            role: 'user',
          },
        });
      }

      await prisma.refreshToken.deleteMany({
        where: {
          userId: userRecord.id,
          revoked: false,
        },
      });

      deleteRegistrationData(regUuid);

      logRegistrationSuccess(email, userRecord.id, ipAddress);

      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
      });
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      logRegistrationFailure('unknown', ipAddress, 'Server error');
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
