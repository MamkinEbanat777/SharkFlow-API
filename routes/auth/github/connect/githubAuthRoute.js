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
import {
  createOrUpdateDeviceSession,
  getGeoLocation,
  validateDeviceId,
} from '../../../../utils/helpers/deviceSessionHelper.js';
import { convertGuestToUser } from '../../../../utils/helpers/guestConversionHelper.js';

const router = Router();

router.post('/auth/oauth/github', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;
  const { code, state, captchaToken } = req.body;
  const guestUuid = req.cookies.log___sf_21s_t1;

  if (!code) {
    return res.status(400).json({ error: 'Код авторизации обязателен' });
  }

  if (process.env.NODE_ENV === 'production') {
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

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Код обязателен' });
  }

  if (!state || typeof state !== 'string') {
    return res.status(400).json({ error: 'State обязателен' });
  }

  const [stateToken, nextPath = '/dashboard'] = state.split('|');

  if (
    !stateToken ||
    stateToken.length < 10 ||
    !/^[a-zA-Z0-9\-_]+$/.test(stateToken)
  ) {
    return res.status(400).json({ error: 'Некорректный state' });
  }

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.CLIENT_GITHUB_ID,
        client_secret: process.env.CLIENT_GITHUB_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' }, timeout: 10000 },
    );

    const accessTokenGH = tokenRes.data.access_token;

    if (!accessTokenGH) {
      return res
        .status(400)
        .json({ error: 'Не удалось получить токен от GitHub' });
    }

    if (tokenRes.data.token_type !== 'bearer') {
      return res.status(400).json({ error: 'Некорректный тип токена' });
    }

    const [userRes, emailsRes] = await Promise.all([
      axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessTokenGH}` },
        timeout: 10000,
      }),
      axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessTokenGH}` },
        timeout: 10000,
      }),
    ]);

    const githubUser = userRes.data;
    const primary = Array.isArray(emailsRes.data)
      ? emailsRes.data.find((e) => e.primary && e.verified)
      : null;
    const email = primary?.email;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'Не удалось получить подтверждённый email из GitHub' });
    }

    let user = await prisma.user.findFirst({
      where: { githubId: String(githubUser.id) },
    });

    if (!user) {
      const existing = await prisma.user.findFirst({ where: { email } });
      if (existing) {
        if (existing.githubId && existing.githubId !== String(githubUser.id)) {
          return res
            .status(403)
            .json({ error: 'Email уже занят другим аккаунтом' });
        }
        if (existing.githubId === String(githubUser.id)) {
          user = existing;
        } else {
          return res.status(403).json({
            error: 'Аккаунт с таким email существует, но не привязан к GitHub. Войдите через пароль или привяжите GitHub аккаунт.',
          });
        }
      } else {
        if (guestUuid) {
          const base = githubUser.login || email.split('@')[0] || 'user';
          const login = await generateUniqueLogin(base);
          
          const convertedUser = await convertGuestToUser(guestUuid, {
            email,
            login,
            oauthData: {
              githubEmail: email,
              githubId: String(githubUser.id),
              githubOAuthEnabled: true,
              password: null,
            },
          });
          
          if (convertedUser) {
            user = convertedUser;
            res.clearCookie('log___sf_21s_t1');
          }
        }
        
        // Если конвертация не удалась или гостевого аккаунта нет, создаем нового пользователя
        if (!user) {
          const base = githubUser.login || email.split('@')[0] || 'user';
          const login = await generateUniqueLogin(base);
          user = await prisma.user.create({
            data: {
              login,
              email,
              githubEmail: email,
              githubId: String(githubUser.id),
              githubOAuthEnabled: true,
              avatarUrl: null,
              password: null,
              role: 'user',
            },
          });
        }
      }
    }

    if (githubUser.avatar_url) {
      const hasAvatar = Boolean(user.avatarUrl);
      const isCloudinary = user.avatarUrl?.includes('res.cloudinary.com');
      if (!hasAvatar || !isCloudinary) {
        await uploadAvatarAndUpdateUser(
          user.id,
          githubUser.avatar_url,
          `github_${githubUser.id}`,
        );
      }
    }

    // Проверяем, что пользователь не является гостевым (после возможной конвертации)
    if (user.role === 'guest' || !user.isActive) {
      return res
        .status(403)
        .json({ error: 'Этот аккаунт не может использовать OAuth' });
    }

    const deviceId = validateDeviceId(req, res);
    if (!deviceId) return;

    const geoLocation = await getGeoLocation(ipAddress);

    const deviceSession = await createOrUpdateDeviceSession({
      userId: user.id,
      deviceId,
      userAgent,
      ipAddress,
      referrer: req.get('Referer') || null,
      geoLocation,
    });

    const refreshToken = await issueRefreshToken({
      userUuid: user.uuid,
      rememberMe: true,
      userId: user.id,
      deviceSessionId: deviceSession.id,
    });

    const accessToken = createAccessToken(user.uuid, user.role);
    const csrfToken = createCsrfToken(user.uuid);

    res.cookie('log___tf_12f_t2', refreshToken, getRefreshCookieOptions(true));

    return res.status(200).json({
      accessToken,
      csrfToken,
      githubOAuthEnabled: user.githubOAuthEnabled,
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
