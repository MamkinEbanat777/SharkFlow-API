import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import {
  logLogout,
  logLogoutInvalidToken,
} from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { REFRESH_COOKIE_NAME } from '../../../config/cookiesConfig.js';

const router = Router();

router.post('/auth/logout', authenticateMiddleware, async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);
  const deviceId = req.headers['x-device-id'];

  if (!deviceId) {
    return res.status(401).json({ error: 'Не удалось определить устройство' });
  }

  if (!refreshToken) {
    return res.status(204).send();
  }

  try {
    await prisma.$transaction(async (tx) => {
      const tokenRecord = await tx.refreshToken.findFirst({
        where: {
          token: refreshToken,
          user: { uuid: userUuid },
          revoked: false,
        },
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              login: true,
              email: true,
            },
          },
        },
      });
      if (tokenRecord) {
        await tx.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { revoked: true },
        });
        const user = await tx.user.findUnique({
          where: { uuid: userUuid },
          select: { id: true },
        });
        if (!user) {
          return res.status(401).json({ error: 'Пользователь не найден' });
        }
        const session = await tx.userDeviceSession.findFirst({
          where: { userId: user.id, deviceId, isActive: true },
        });
        if (!session) {
          return res.status(200).json({ message: 'Вы успешно вышли из системы' });
        }
        await tx.userDeviceSession.update({
          where: { id: session.id },
          data: { isActive: false },
        });
        logLogout(
          tokenRecord.user.login,
          tokenRecord.user.email,
          userUuid,
          ipAddress,
        );
      } else {
        logLogoutInvalidToken(userUuid, ipAddress);
      }
    });
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    return res.status(200).json({ message: 'Вы успешно вышли из системы' });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при выходе из системы',
      status: 500,
      message: 'Произошла ошибка при выходе из системы',
    });
  }
});

export default {
  path: '/',
  router,
};
