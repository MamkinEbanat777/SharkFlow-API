import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { getGuestCookieOptions } from '../../../utils/cookie/registerCookie.js';
import { findUserByUuid } from '../../../utils/helpers/userHelpers.js';
import {
  createAuthTokens,
  setAuthCookies,
} from '../../../utils/helpers/authHelpers.js';
import { verifyTurnstileCaptcha } from '../../../utils/helpers/verifyTurnstileCaptchaHelper.js';
import { generateUUID } from '../../../utils/generators/generateUUID.js';

const router = Router();

router.post('/auth/guest-login', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;

  if (process.env.NODE_ENV === 'production') {
    const { captchaToken } = req.body;

    if (!captchaToken) {
      return res
        .status(400)
        .json({ error: 'Пожалуйста, подтвердите, что вы не робот!' });
    }

    const turnstileUuid = generateUUID();

    try {
      const captchaSuccess = await verifyTurnstileCaptcha(
        captchaToken,
        ipAddress,
        turnstileUuid,
      );
      if (!captchaSuccess) {
        return res
          .status(400)
          .json({ error: 'Captcha не пройдена. Попробуйте еще раз' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  try {
    const guestUuid = req.cookies.log___sf_21s_t1;

    if (guestUuid) {
      const existingGuest = await findUserByUuid(guestUuid);
      if (existingGuest && existingGuest.role === 'guest') {
        const deviceId = req.headers['x-device-id'];
        if (!deviceId) {
          return res.status(401).json({ error: 'Устройство не найдено' });
        }
        let deviceSession = await prisma.userDeviceSession.findFirst({
          where: { userId: existingGuest.id, deviceId, isActive: true },
        });
        if (deviceSession) {
          deviceSession = await prisma.userDeviceSession.update({
            where: { id: deviceSession.id },
            data: {
              userAgent,
              ipAddress,
              lastLoginAt: new Date(),
              isActive: true,
            },
          });
        } else {
          deviceSession = await prisma.userDeviceSession.create({
            data: {
              userId: existingGuest.id,
              deviceId,
              userAgent,
              ipAddress,
              lastLoginAt: new Date(),
              isActive: true,
            },
          });
        }
        const tokens = await createAuthTokens(
          existingGuest,
          false,
          deviceSession.id,
        );
        setAuthCookies(res, tokens.refreshToken, false);
        res.cookie(
          'log___sf_21s_t1',
          existingGuest.uuid,
          getGuestCookieOptions(),
        );

        return res.status(200).json({
          accessToken: tokens.accessToken,
          csrfToken: tokens.csrfToken,
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

    const deviceId = req.headers['x-device-id'];
    if (!deviceId) {
      return res.status(401).json({ error: 'Устройство не найдено' });
    }
    let deviceSession = await prisma.userDeviceSession.findFirst({
      where: { userId: guest.id, deviceId, isActive: true },
    });
    if (deviceSession) {
      deviceSession = await prisma.userDeviceSession.update({
        where: { id: deviceSession.id },
        data: {
          userAgent,
          ipAddress,
          lastLoginAt: new Date(),
          isActive: true,
        },
      });
    } else {
      deviceSession = await prisma.userDeviceSession.create({
        data: {
          userId: guest.id,
          deviceId,
          userAgent,
          ipAddress,
          lastLoginAt: new Date(),
          isActive: true,
        },
      });
    }
    const tokens = await createAuthTokens(guest, false, deviceSession.id);
    setAuthCookies(res, tokens.refreshToken, false);
    res.cookie('log___sf_21s_t1', guest.uuid, getGuestCookieOptions());

    return res.status(200).json({
      accessToken: tokens.accessToken,
      csrfToken: tokens.csrfToken,
      role: guest.role,
    });
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
