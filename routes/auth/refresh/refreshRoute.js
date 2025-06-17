import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createAccessToken } from '../../../utils/tokens/accessToken.js';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { createRefreshToken } from '../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../utils/cookie/loginCookie.js';

const router = Router();

router.post('/api/auth/refresh', async (req, res) => {
  const referrer = req.get('Referer') || null;
  const refreshToken = req.cookies.log___tf_12f_t2;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: 'Сессия истекла. Пожалуйста войдите снова' });
  }
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const now = Date.now();
  try {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.revoked) {
      return res.status(401).json({
        message: 'Сессия истекла. Пожалуйста войдите снова',
      });
    }

    if (new Date() > tokenRecord.expiresAt) {
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });
      return res
        .status(401)
        .json({ message: 'Токен обновления истек. Пожалуйста войдите снова' });
    }

    const expiresAt = new Date(tokenRecord.expiresAt).getTime();
    const timeLeft = expiresAt - now;

    let newRefreshToken = refreshToken;
    let rotated = false;

    if (timeLeft < 600000) {
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });

      newRefreshToken = createRefreshToken(
        payload.userUuid,
        tokenRecord.rememberMe,
      );
      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: tokenRecord.userId,
          expiresAt: new Date(
            now +
              (tokenRecord.rememberMe
                ? Number(process.env.SESSION_EXPIRES_REMEMBER_ME)
                : Number(process.env.SESSION_EXPIRES_DEFAULT)),
          ),
          ipAddress: req.ip,
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

    const newAccessToken = createAccessToken(payload.userUuid);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      return res.status(401).json({
        message: 'Ваша сессия истекла. Пожалуйста войдите снова',
      });
    }
    console.error(error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
