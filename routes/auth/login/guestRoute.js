import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { createAccessToken } from '../../../utils/tokens/accessToken.js';
import { issueRefreshToken } from '../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../utils/cookie/loginCookie.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { getGuestCookieOptions } from '../../../utils/cookie/registerCookie.js';
import { createCsrfToken } from '../../../utils/tokens/csrfToken.js';

const router = Router();

router.post('/api/auth/guest-login', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;
  try {
    const guestUuid = req.cookies.log___sf_21s_t1;

    if (guestUuid) {
      const existingGuest = await prisma.user.findFirst({
        where: { uuid: guestUuid, isDeleted: false },
      });
      if (existingGuest && existingGuest.role === 'guest') {
        const accessToken = createAccessToken(
          existingGuest.uuid,
          existingGuest.role,
        );

        const csrfToken = createCsrfToken(
          existingGuest.uuid,
          existingGuest.role,
        );

        const refreshToken = await issueRefreshToken({
          res,
          userUuid: existingGuest.uuid,
          rememberMe: false,
          ipAddress,
          userAgent,
          referrer: req.get('Referer') || null,
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
          csrfToken,
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
    const csrfToken = createCsrfToken(guest.uuid, guest.role);
    const refreshToken = await issueRefreshToken({
      res,
      userUuid: guest.uuid,
      rememberMe: false,
      ipAddress,
      userAgent,
      referrer: req.get('Referer') || null,
    });

    res.cookie('log___tf_12f_t2', refreshToken, getRefreshCookieOptions(false));
    res.cookie('log___sf_21s_t1', guest.uuid, getGuestCookieOptions());

    return res.status(200).json({ accessToken, csrfToken, role: guest.role });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при гостевом входе',
      status: 500,
      message: 'Ошибка при гостевом входе. Попробуйте позже',
    });
  }
});

export default {
  path: '/',
  router,
};
