import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { createAccessToken } from '../../../utils/tokens/accessToken.js';
import { createRefreshToken } from '../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../utils/cookie/loginCookie.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/api/auth/guest-login', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;
  try {
    const guestUuid = req.cookies.log___sf_21s_t1;

    if (guestUuid) {
      const existingGuest = await prisma.user.findUnique({
        where: { uuid: guestUuid },
      });
      if (existingGuest && existingGuest.role === 'guest') {
        const accessToken = createAccessToken(
          existingGuest.uuid,
          existingGuest.role,
        );

        const refreshToken = createRefreshToken(existingGuest.uuid, false);

        await prisma.refreshToken.create({
          data: {
            token: refreshToken,
            expiresAt: new Date(
              Date.now() + Number(process.env.SESSION_EXPIRES_DEFAULT),
            ),
            revoked: false,
            rememberMe: false,
            ipAddress,
            userAgent,
            userId: existingGuest.id,
          },
        });

        res.cookie(
          'log___tf_12f_t2',
          refreshToken,
          getRefreshCookieOptions(false),
        );
        res.cookie(
          'log___sf_21s_t1',
          existingGuest.uuid,
          getRefreshCookieOptions(false),
        );

        return res.status(200).json({
          accessToken,
          role: existingGuest.role,
        });
      }
    }

    const rawUuid = uuidv4();
    const fakeEmail = `guest-${rawUuid}@guest.local`;
    const fakeLogin = `guest-${rawUuid.slice(0, 8)}`;
    const hashedPassword = await bcrypt.hash(rawUuid, 10);
    const guest = await prisma.user.create({
      data: {
        email: fakeEmail,
        login: fakeLogin,
        password: hashedPassword,
        role: 'guest',
      },
    });

    const accessToken = createAccessToken(guest.uuid, guest.role);
    const refreshToken = createRefreshToken(guest.uuid, false);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: new Date(
          Date.now() + Number(process.env.SESSION_EXPIRES_DEFAULT),
        ),
        revoked: false,
        rememberMe: false,
        ipAddress,
        userAgent,
        userId: guest.id,
      },
    });

    res.cookie('log___tf_12f_t2', refreshToken, getRefreshCookieOptions(false));
    res.cookie('log___sf_21s_t1', guest.uuid, getRefreshCookieOptions(false));

    return res.status(200).json({ accessToken, role: guest.role });
  } catch (error) {
    console.error('Ошибка при логине:', error);
    res.status(500).json({ error: 'Ошибка сервера. Пожалуйста, попробуйте' });
  }
});

export default {
  path: '/',
  router,
};
