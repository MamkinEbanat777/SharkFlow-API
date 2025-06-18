import { Router } from 'express';
import { createAccessToken } from '../../../utils/tokens/accessToken.js';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { createRefreshToken } from '../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../utils/cookie/loginCookie.js';
import { validateRefreshToken, isTokenExpired, shouldRotateToken } from '../../../utils/validators/jwtValidators.js';
import { logTokenRefresh, logTokenRefreshFailure } from '../../../utils/loggers/authLoggers.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';

const router = Router();

router.post('/api/auth/refresh', async (req, res) => {
  const referrer = req.get('Referer') || null;
  const refreshToken = req.cookies.log___tf_12f_t2;
  const ipAddress = getClientIP(req);

  const tokenValidation = validateRefreshToken(refreshToken);
  if (!tokenValidation.isValid) {
    return res.status(401).json({ message: tokenValidation.error });
  }

  const { payload } = tokenValidation;
  const userUuid = payload.userUuid;

  try {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        revoked: true,
        rememberMe: true
      }
    });

    if (!tokenRecord || tokenRecord.revoked) {
      logTokenRefreshFailure(userUuid, ipAddress, 'Token revoked or not found');
      return res.status(401).json({
        message: 'Ваша сессия была завершена. Пожалуйста, войдите в систему заново',
      });
    }

    if (isTokenExpired(tokenRecord.expiresAt)) {
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });
      logTokenRefreshFailure(userUuid, ipAddress, 'Token expired');
      return res
        .status(401)
        .json({ message: 'Ваша сессия истекла. Пожалуйста, войдите в систему заново' });
    }

    let newRefreshToken = refreshToken;
    let rotated = false;

    if (shouldRotateToken(tokenRecord.expiresAt)) {
      const [newToken] = await Promise.all([
        Promise.resolve(createRefreshToken(userUuid, tokenRecord.rememberMe)),
        prisma.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { revoked: true },
        })
      ]);

      newRefreshToken = newToken;
      
      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: tokenRecord.userId,
          expiresAt: new Date(
            Date.now() +
              (tokenRecord.rememberMe
                ? Number(process.env.SESSION_EXPIRES_REMEMBER_ME)
                : Number(process.env.SESSION_EXPIRES_DEFAULT)),
          ),
          ipAddress,
          userAgent: req.get('User-Agent'),
          referrer,
          rememberMe: tokenRecord.rememberMe,
        },
      });

      rotated = true;
    }

    if (rotated) {
      res.cookie(
        'log___tf_12f_t2',
        newRefreshToken,
        getRefreshCookieOptions(tokenRecord.rememberMe),
      );
    }

    const newAccessToken = createAccessToken(userUuid);

    logTokenRefresh(userUuid, ipAddress, rotated);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    logTokenRefreshFailure(userUuid, ipAddress, 'Server error');
    return res.status(500).json({ error: 'Произошла внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
