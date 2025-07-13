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

router.post('/auth/oauth/yandex', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;
  const { code, state, captchaToken } = req.body;
  const guestUuid = req.cookies.log___sf_21s_t1;

  if (!code || typeof code !== 'string') {
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

  const redirectUri =
    process.env.NODE_ENV === 'production'
      ? 'https://sharkflow.onrender.com/oauth/yandex/callback'
      : 'http://localhost:5173/oauth/yandex/callback';

  try {
    const tokenRes = await axios.post(
      'https://oauth.yandex.ru/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.CLIENT_YANDEX_ID,
        client_secret: process.env.CLIENT_YANDEX_SECRET,
        redirect_uri: redirectUri,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      },
    );

    const accessTokenYA = tokenRes.data.access_token;

    if (!accessTokenYA) {
      return res
        .status(400)
        .json({ error: 'Не удалось получить токен от Yandex' });
    }

    if (tokenRes.data.token_type !== 'bearer') {
      return res.status(400).json({ error: 'Некорректный тип токена' });
    }

    const userRes = await axios.get('https://login.yandex.ru/info', {
      headers: { Authorization: `OAuth ${accessTokenYA}` },
      timeout: 10000,
    });

    const yandexUser = userRes.data;
    const email = yandexUser.default_email;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'Не удалось получить email из Yandex' });
    }

    let user = await prisma.user.findFirst({
      where: { yandexId: String(yandexUser.id) },
    });

    if (!user) {
      const existing = await prisma.user.findFirst({ where: { email } });
      if (existing) {
        if (existing.yandexId && existing.yandexId !== String(yandexUser.id)) {
          return res
            .status(403)
            .json({ error: 'Email уже занят другим аккаунтом' });
        }
        if (existing.yandexId === String(yandexUser.id)) {
          user = existing;
        } else {
          return res.status(403).json({
            error: 'Аккаунт с таким email существует, но не привязан к Yandex. Войдите через пароль или привяжите Yandex аккаунт.',
          });
        }
      } else {
        if (guestUuid) {
          const base = yandexUser.login || email.split('@')[0] || 'user';
          const login = await generateUniqueLogin(base);
          
          const convertedUser = await convertGuestToUser(guestUuid, {
            email,
            login,
            oauthData: {
              yandexEmail: email,
              yandexId: String(yandexUser.id),
              yandexOAuthEnabled: true,
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
          const base = yandexUser.login || email.split('@')[0] || 'user';
          const login = await generateUniqueLogin(base);
          user = await prisma.user.create({
            data: {
              login,
              email,
              yandexEmail: email,
              yandexId: String(yandexUser.id),
              yandexOAuthEnabled: true,
              avatarUrl: null,
              password: null,
              role: 'user', 
            },
          });
        }
      }
    }

    const avatarUrl = yandexUser.default_avatar_id
      ? `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200`
      : null;

    if (avatarUrl) {
      const hasAvatar = Boolean(user.avatarUrl);
      const isCloudinary = user.avatarUrl?.includes('res.cloudinary.com');
      if (!hasAvatar || !isCloudinary) {
        await uploadAvatarAndUpdateUser(
          user.id,
          avatarUrl,
          `yandex_${yandexUser.id}`,
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
      yandexOAuthEnabled: user.yandexOAuthEnabled,
    });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при логине через Yandex',
      status: 500,
      message: 'Не удалось войти через Yandex. Попробуйте позже.',
    });
  }
});

export default {
  path: '/',
  router,
};
