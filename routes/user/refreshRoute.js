import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createAccessToken } from '../../utils/tokens/accessToken.js';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { createRefreshToken } from '../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../utils/cookie/loginCookie.js';

const router = Router();

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.tf__2;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: 'Сессия истекла. Пожалуйста войдите снова' });
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
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

    const now = Date.now();
    const expiresAt = new Date(tokenRecord.expiresAt).getTime();
    const timeLeft = expiresAt - now;

    let newRefreshToken = refreshToken;
    let rotated = false;

    if (timeLeft < 10 * 60 * 1000) {
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });

      newRefreshToken = createRefreshToken(
        payload.userUuid,
        tokenRecord.rememberMe,
      );
      const referrer = req.get('Referer') || null;
      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: tokenRecord.userId,
          expiresAt: new Date(
            now +
              (tokenRecord.rememberMe
                ? 30 * 24 * 60 * 60 * 1000
                : 24 * 60 * 60 * 1000),
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
        'tf__2',
        newRefreshToken,
        getRefreshCookieOptions(tokenRecord.rememberMe),
      );
    }

    const newAccessToken = createAccessToken(payload.userUuid);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    if (
      err instanceof jwt.TokenExpiredError ||
      err instanceof jwt.JsonWebTokenError
    ) {
      return res.status(401).json({
        message: 'Ваша сессия истекла. Пожалуйста войдите снова',
      });
    }
    console.error(err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
