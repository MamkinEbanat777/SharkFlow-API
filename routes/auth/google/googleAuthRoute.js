import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { createAccessToken } from '../../../utils/tokens/accessToken.js';
import { issueRefreshToken } from '../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../utils/cookie/loginCookie.js';
import { getClientIP } from '../../../utils/helpers/ipHelper.js';
import { OAuth2Client } from 'google-auth-library';
import { generateUniqueLogin } from '../../../utils/generators/generateUniqueLogin.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { uploadAvatarAndUpdateUser } from '../../../utils/helpers/uploadAvatarAndUpdateUser.js';

const router = Router();

const oauth2Client = new OAuth2Client(
  process.env.CLIENT_GOOGLE_ID,
  process.env.CLIENT_GOOGLE_SECRET,
  'postmessage',
);

router.post('/api/auth/google', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'authorization code обязателен' });
  }

  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: 'postmessage',
    });

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_GOOGLE_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload);
    const googleSub = payload.sub;
    const email = payload.email;
    const emailVerified = payload.email_verified;
    const given_name = payload.given_name;
    let avatarUrl = payload.picture;

    if (!googleSub) {
      return res.status(400).json({ error: 'Некорректный токен Google' });
    }

    if (!email || !emailVerified) {
      return res.status(400).json({
        error: 'Некорректный или неподтверждённый email Google',
      });
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleSub }, { email }] },
    });

    if (user) {
      if (user.isDeleted) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            isDeleted: false,
            googleOAuthEnabled: true,
            deletedAt: null,
            googleSub,
            avatarUrl,
          },
        });
        const needsAvatarUpdate =
          !user.avatarUrl || !user.avatarUrl.includes('res.cloudinary.com');

        if (needsAvatarUpdate && avatarUrl) {
          await uploadAvatarAndUpdateUser(
            user.id,
            avatarUrl,
            `google_${googleSub}`,
          );
        } else {
          avatarUrl = user.avatarUrl;
        }
      } else if (!user.googleSub) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleSub, googleOAuthEnabled: true, avatarUrl },
        });
      }
    } else {
      const base = given_name || email.split('@')[0] || 'user';
      const login = await generateUniqueLogin(base);

      user = await prisma.user.create({
        data: {
          login,
          email,
          googleSub,
          googleOAuthEnabled: true,
          avatarUrl: null,
          password: null,
        },
      });
      if (avatarUrl) {
        await uploadAvatarAndUpdateUser(
          user.id,
          avatarUrl,
          `google_${googleSub}`,
        );
      }
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
    return res.status(200).json({ accessToken });
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
