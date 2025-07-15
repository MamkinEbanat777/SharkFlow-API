import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { deleteConfirmationCode } from '../../../store/userVerifyStore.js';
import {
  logUserDelete,
  logUserDeleteFailure,
} from '../../../utils/loggers/authLoggers.js';
import { getRequestInfo } from '../../../utils/helpers/authHelpers.js';
import cloudinary from 'cloudinary';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { validateConfirmationCode } from '../../../utils/helpers/validateConfirmationCode.js';
import { emailConfirmValidate } from '../../../utils/validators/emailConfirmValidate.js';
import { validateMiddleware } from '../../../middlewares/http/validateMiddleware.js';
import { findUserByUuidOrThrow } from '../../../utils/helpers/userHelpers.js';
import { REFRESH_COOKIE_NAME } from '../../../config/cookiesConfig.js';
import { validateAndDeleteConfirmationCode } from '../../../utils/helpers/confirmationHelpers.js';

const router = Router();

router.post(
  '/users/delete',
  authenticateMiddleware,
  validateMiddleware(emailConfirmValidate),
  async (req, res) => {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    const userUuid = req.userUuid;
    const { confirmationCode } = req.body;
    const { ipAddress } = getRequestInfo(req);

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

    const validation = await validateAndDeleteConfirmationCode(
      userUuid,
      'deleteUser',
      confirmationCode,
    );
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const user = await findUserByUuidOrThrow(userUuid, false, {
        publicId: true,
        role: true,
      });

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
        // Деактивируем все UserOAuth
        prisma.userOAuth.updateMany({
          where: { userId: user.id },
          data: { enabled: false },
        }),
        prisma.user.update({
          where: { uuid: userUuid },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            avatarUrl: null,
            publicId: null,
          },
        }),
      ]);

      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });

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
