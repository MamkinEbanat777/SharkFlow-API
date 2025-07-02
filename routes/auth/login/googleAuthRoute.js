import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { createAccessToken } from '../../../utils/tokens/accessToken.js';
import { createRefreshToken } from '../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../utils/cookie/loginCookie.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { OAuth2Client } from 'google-auth-library';
import { generateUniqueLogin } from '../../../utils/generators/generateUniqueLogin.js';

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

    if (!user) {
      const base = email?.split('@')[0] || name || 'user';
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
    } else if (!user.googleSub) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleSub },
      });
    }

    const refreshToken = createRefreshToken(user.uuid, true);

    const accessToken = createAccessToken(user.uuid, user.role);

    res.cookie('log___tf_12f_t2', refreshToken, getRefreshCookieOptions(false));

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: new Date(
          Date.now() + Number(process.env.SESSION_EXPIRES_REMEMBER_ME),
        ),
        revoked: false,
        rememberMe: true,
        ipAddress,
        userAgent,
        userId: user.id,
      },
    });

    return res.status(200).json({
      accessToken,
      role: user.role,
      avatarUrl: user.avatarUrl,
      login: user.login,
      email: user.email,
    });
  } catch (error) {
    console.error('Ошибка при логине через Google:', error);
    return res.status(500).json({ error: 'Ошибка сервера. Попробуйте позже.' });
  }
});

export default {
  path: '/',
  router,
};
