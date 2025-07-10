import { Router } from 'express';
import axios from 'axios';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { createAccessToken } from '../../../../utils/tokens/accessToken.js';
import { issueRefreshToken } from '../../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../../utils/cookie/loginCookie.js';
import { getClientIP } from '../../../../utils/helpers/authHelpers.js';
import { generateUniqueLogin } from '../../../../utils/generators/generateUniqueLogin.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { uploadAvatarAndUpdateUser } from '../../../../utils/helpers/uploadAvatarAndUpdateUser.js';
import { createCsrfToken } from '../../../../utils/tokens/csrfToken.js';
import { generateUUID } from '../../../../utils/generators/generateUUID.js';
import { verifyTurnstileCaptcha } from '../../../../utils/helpers/verifyTurnstileCaptchaHelper.js';

const router = Router();

router.post('/api/auth/github', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;
  const { code, captchaToken } = req.body;

  console.log('captchaToken: ', captchaToken);

  if (!code) {
    return res.status(400).json({ error: 'Код авторизации обязателен' });
  }

  if (process.env.NODE_ENV === 'production') {
    if (!captchaToken) {
      return res
        .status(400)
        .json({ error: 'Пожалуйста, подтвердите, что вы не робот!' });
    }
    const uuid = generateUUID();
    const ok = await verifyTurnstileCaptcha(captchaToken, ipAddress, uuid);
    if (!ok) {
      return res
        .status(400)
        .json({ error: 'Captcha не пройдена. Попробуйте ещё раз.' });
    }
  }

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.CLIENT_GITHUB_ID,
        client_secret: process.env.CLIENT_GITHUB_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } },
    );
    const accessTokenGH = tokenRes.data.access_token;
    if (!accessTokenGH) {
      return res
        .status(400)
        .json({ error: 'Не удалось получить токен от GitHub' });
    }

    const [userRes, emailsRes] = await Promise.all([
      axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessTokenGH}` },
      }),
      axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessTokenGH}` },
      }),
    ]);
    const githubUser = userRes.data;
    const primaryEmailObj = emailsRes.data.find((e) => e.primary && e.verified);
    const email = primaryEmailObj?.email;
    if (!email) {
      return res
        .status(400)
        .json({ error: 'Не удалось получить подтверждённый email из GitHub' });
    }

    let user = await prisma.user.findFirst({
      where: { githubId: String(githubUser.id) },
    });

    if (!user) {
      const byEmail = await prisma.user.findFirst({ where: { email } });
      if (byEmail) {
        if (byEmail.githubId && byEmail.githubId !== String(githubUser.id)) {
          return res
            .status(403)
            .json({ error: 'Этот email уже занят другим аккаунтом' });
        }
        user = await prisma.user.update({
          where: { id: byEmail.id },
          data: { githubId: String(githubUser.id) },
        });
      } else {
        const baseLogin = githubUser.login || email.split('@')[0];
        const login = await generateUniqueLogin(baseLogin);
        user = await prisma.user.create({
          data: {
            login,
            email,
            githubId: String(githubUser.id),
            avatarUrl: githubUser.avatar_url,
            role: 'user',
          },
        });
      }
    }

    if (
      githubUser.avatar_url &&
      !user.avatarUrl?.includes('res.cloudinary.com')
    ) {
      await uploadAvatarAndUpdateUser(
        user.id,
        githubUser.avatar_url,
        `github_${githubUser.id}`,
      );
    }

    if (user.role === 'guest' || !user.isActive) {
      return res
        .status(403)
        .json({ error: 'Этот аккаунт не может использовать OAuth' });
    }

    const refreshToken = await issueRefreshToken({
      res,
      userUuid: user.uuid,
      rememberMe: true,
      ipAddress,
      userAgent,
      referrer: req.get('referer') || null,
      userId: user.id,
    });
    const accessToken = createAccessToken(user.uuid, user.role);
    const csrfToken = createCsrfToken(user.uuid);

    res
      .cookie('refresh_token', refreshToken, getRefreshCookieOptions(true))
      .status(200)
      .json({
        accessToken,
        csrfToken,
        githubOAuthEnabled: true,
      });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при логине через GitHub',
      status: 500,
      message: 'Не удалось войти через GitHub. Попробуйте позже.',
    });
  }
});

export default {
  path: '/',
  router,
};
