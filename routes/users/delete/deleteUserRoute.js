import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { deleteConfirmationCode } from '../../../store/userVerifyStore.js';
import {
  logUserDelete,
  logUserDeleteFailure,
} from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';
import cloudinary from 'cloudinary';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../utils/helpers/validateConfirmationCode.js';
import { emailConfirmValidate } from '../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../middlewares/http/validateMiddleware.js';
import { findUserByUuid } from '../../../utils/helpers/userHelpers.js';

const router = Router();

router.post(
  '/api/users/delete',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const refreshToken = req.cookies.log___tf_12f_t2;
    const userUuid = req.userUuid;
    const { confirmationCode } = req.body;
    const ipAddress = getClientIP(req);

    if (!refreshToken || !userUuid) {
      return res.status(401).json({ error: 'Нет доступа или неавторизован' });
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revoked: false,
        expiresAt: { gt: new Date() },
        user: { uuid: userUuid },
      },
      select: { userId: true },
    });

    if (!tokenRecord) {
      logUserDeleteFailure(userUuid, ipAddress, 'Invalid or expired token');
      return res
        .status(401)
        .json({ error: 'Недействительный или чужой токен' });
    }

    const valid = await validateConfirmationCode(
      userUuid,
      'deleteUser',
      confirmationCode,
    );
    if (!valid) {
      return res
        .status(400)
        .json({ error: 'Неверный или просроченный код подтверждения' });
    }

    try {
      const user = await findUserByUuid(userUuid, { publicId: true, role: true });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      if (user.role === 'guest') {
        return res
          .status(403)
          .json({ error: 'Гостевой аккаунт нельзя удалить' });
      }

      if (user?.publicId) {
        await cloudinary.v2.uploader.destroy(user.publicId);
      }

      await prisma.$transaction([
        prisma.refreshToken.updateMany({
          where: { token: refreshToken },
          data: { revoked: true },
        }),

        prisma.task.updateMany({
          where: {
            board: {
              user: {
                uuid: userUuid,
                isDeleted: false,
              },
            },
            isDeleted: false,
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        }),

        prisma.board.updateMany({
          where: {
            user: {
              uuid: userUuid,
              isDeleted: false,
            },
            isDeleted: false,
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        }),

        prisma.user.update({
          where: { uuid: userUuid },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            avatarUrl: null,
            publicId: null,
            twoFactorSecret: null,
            twoFactorPendingSecret: null,
            twoFactorEnabled: false,
            googleSub: null,
            googleEmail: null,
            googleOAuthEnabled: false,
            telegramId: null,
            telegramEnabled: false,
          },
        }),
      ]);

      res.clearCookie('log___tf_12f_t2', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });

      await deleteConfirmationCode('deleteUser', userUuid);

      logUserDelete(userUuid, ipAddress);

      res.status(200).json({ message: 'Вы успешно удалили аккаунт' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при удалении пользователя',
        mappings: {
          P2025: { status: 404, message: 'Пользователь не найден' },
        },
        status: 500,
        message:
          'Произошла внутренняя ошибка сервера при удалении пользователя',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
