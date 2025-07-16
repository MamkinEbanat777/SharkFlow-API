import { Router } from 'express';
import prisma from '#utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { logLogout, logLogoutAttempt, logLogoutFailure } from '#utils/loggers/authLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { validateDeviceId } from '#utils/helpers/deviceSessionHelper.js';
import { REFRESH_COOKIE_NAME } from '#config/cookiesConfig.js';

const router = Router();

router.post(
  '/auth/logout/:deviceId',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { ipAddress, userAgent } = getRequestInfo(req);
    const { deviceId } = req.params;

    logLogoutAttempt(userUuid, ipAddress, userAgent, deviceId);

    const validatedDeviceId = validateDeviceId(req, res);
    if (!validatedDeviceId) return;

    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    let currentDeviceId = null;
    if (refreshToken) {
      const tokenRecord = await prisma.refreshToken.findFirst({
        where: { token: refreshToken, revoked: false },
        select: { deviceSession: { select: { deviceId: true } } },
      });
      currentDeviceId = tokenRecord?.deviceSession?.deviceId;
    }

    if (currentDeviceId && deviceId === currentDeviceId) {
      logLogoutFailure(userUuid, ipAddress, 'Попытка выйти с текущего устройства', userAgent, deviceId);
      return res
        .status(400)
        .json({ error: 'Нельзя выйти с текущего устройства этим способом' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { uuid: userUuid },
        select: { id: true, login: true, email: true },
      });

      if (!user) {
        logLogoutFailure(userUuid, ipAddress, 'Пользователь не найден', userAgent, deviceId);
        return res.status(401).json({ error: 'Пользователь не найден' });
      }

      const session = await prisma.userDeviceSession.findFirst({
        where: { userId: user.id, deviceId, isActive: true },
      });

      if (!session) {
        logLogoutFailure(userUuid, ipAddress, 'Сессия не найдена или уже неактивна', userAgent, deviceId);
        return res
          .status(404)
          .json({ error: 'Сессия не найдена или уже неактивна' });
      }

      await prisma.userDeviceSession.update({
        where: { id: session.id },
        data: { isActive: false },
      });

      await prisma.refreshToken.updateMany({
        where: { deviceSessionId: session.id, revoked: false },
        data: { revoked: true },
      });

      logLogout(user.login, user.email, userUuid, ipAddress);

      return res.status(200).json({ message: 'Вы успешно вышли с устройства' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при выходе с устройства',
        status: 500,
        message: 'Произошла ошибка при выходе с устройства',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
