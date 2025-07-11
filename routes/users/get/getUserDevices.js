import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { logUserFetch } from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { findUserByUuid } from '../../../utils/helpers/userHelpers.js';
import prisma from '../../../utils/prismaConfig/prismaClient.js';

const router = Router();

router.get('/api/users/devices', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);

  try {
    const user = await findUserByUuid(userUuid, {
        id: true,    
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    logUserFetch(userUuid, ipAddress);

    const devices = await prisma.userDeviceSession.findMany({
        where: { userId: user.id },
        select: {
          deviceId: true,
          ipAddress: true,
          geoLocation: true,
          deviceType: true,
          deviceBrand: true,
          deviceModel: true,
          osName: true,
          osVersion: true,
          clientName: true,
          clientVersion: true,
          userAgent: true,
          createdAt: true,
          lastLoginAt: true,
          lastUsedAt: true,
          isActive: true,
        },
        orderBy: { lastLoginAt: 'desc' },
      });

    return res.json({devices});
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при получении устройств пользователя',
      status: 500,
      message: 'Ошибка сервера',
    });
  }
});

export default {
  path: '/',
  router,
};
