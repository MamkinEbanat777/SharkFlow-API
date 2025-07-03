import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { createAccessToken } from '../../../utils/tokens/accessToken.js';
import { createRefreshToken, issueRefreshToken } from '../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../utils/cookie/loginCookie.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { OAuth2Client } from 'google-auth-library';
import { generateUniqueLogin } from '../../../utils/generators/generateUniqueLogin.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

router.post('/api/auth/google', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'idToken обязателен' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleSub = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const avatarUrl = payload.picture;

    if (!googleSub || !email) {
      return res.status(400).json({ error: 'Некорректный токен Google' });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleSub }, { email }],
      },
    });

    if (user) {
      if (user.isDeleted) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            isDeleted: false,
            deletedAt: null,
            googleSub,
            avatarUrl,
          },
        });
      } else if (!user.googleSub) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleSub },
        });
      }
    } else {
      const base = email.split('@')[0] || name || 'user';
      const login = await generateUniqueLogin(base);
      user = await prisma.user.create({
        data: {
          login,
          email,
          googleSub,
          avatarUrl,
          password: null,
          role: 'user',
        },
      });
    }

    const refreshToken = await issueRefreshToken({
      res,
      userUuid: user.uuid,
      rememberMe: true,
      ipAddress,
      userAgent,
      referrer: req.get('Referer') || null,
    });

    const accessToken = createAccessToken(user.uuid, user.role);

    res.cookie('log___tf_12f_t2', refreshToken, getRefreshCookieOptions(false));

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при логине через Google',
      status: 500,
      message: 'Ошибка при логине через Google. Попробуйте позже.',
    });
  }
});

export default {
  path: '/',
  router,
};
