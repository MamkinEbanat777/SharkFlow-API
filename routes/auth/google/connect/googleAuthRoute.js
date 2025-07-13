import { Router } from 'express';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { createAccessToken } from '../../../../utils/tokens/accessToken.js';
import { issueRefreshToken } from '../../../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../../../utils/cookie/loginCookie.js';
import { getClientIP } from '../../../../utils/helpers/authHelpers.js';
import { OAuth2Client } from 'google-auth-library';
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

const oauth2Client = new OAuth2Client(
  process.env.CLIENT_GOOGLE_ID,
  process.env.CLIENT_GOOGLE_SECRET,
  'postmessage',
);

router.post('/auth/oauth/google', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;
  const { code, captchaToken } = req.body;
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

  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: 'postmessage',
    });

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_GOOGLE_ID,
    });
    const {
      sub: googleSub,
      email,
      email_verified: emailVerified,
      given_name,
      picture: pic,
    } = ticket.getPayload();
    if (!googleSub)
      return res.status(400).json({ error: 'Некорректный токен Google' });
    if (!email || !emailVerified)
      return res
        .status(400)
        .json({ error: 'Некорректный или неподтверждённый email Google' });

    let user = null;
    const avatarUrl = pic;

    const userByEmail = await prisma.user.findFirst({
      where: { email },
    });

    const userByGoogleSub = await prisma.user.findFirst({
      where: { googleSub },
    });

    if (userByEmail) {
      if (!userByEmail.isActive) {
        return res
          .status(403)
          .json({ error: 'Аккаунт заблокирован. Обратитесь в поддержку.' });
      }

      if (userByEmail.googleSub === googleSub) {
        if (userByEmail.isDeleted) {
          user = await prisma.user.update({
            where: { id: userByEmail.id },
            data: {
              isDeleted: false,
              deletedAt: null,
              googleOAuthEnabled: true,
            },
          });
        } else {
          user = userByEmail;
        }
      } else if (userByEmail.googleSub && userByEmail.googleSub !== googleSub) {
        return res
          .status(403)
          .json({ error: 'Email уже привязан к другому Google аккаунту' });
      } else if (userByEmail.isDeleted) {
        return res.status(403).json({
          error:
            'Аккаунт с этой почтой был удален. Пожалуйста, используйте другую почту или обратитесь в поддержку для восстановления аккаунта.',
        });
      } else {
        return res.status(403).json({
          error: 'Аккаунт с таким email существует, но не привязан к Google. Войдите через пароль или привяжите Google аккаунт.',
        });
      }
    } else if (userByGoogleSub) {
      if (userByGoogleSub.isDeleted) {
        return res.status(403).json({
          error:
            'Google аккаунт был связан с удаленным профилем. Пожалуйста, используйте другой Google аккаунт или обратитесь в поддержку.',
        });
      } else {
        return res.status(403).json({
          error:
            'Google аккаунт уже связан с другим профилем. Пожалуйста, используйте другой Google аккаунт.',
        });
      }
    }

    if (!user) {
      // Проверяем возможность конвертации гостевого аккаунта
      if (guestUuid) {
        const baseLogin = given_name || email.split('@')[0] || 'user';
        const login = await generateUniqueLogin(baseLogin);
        
        const convertedUser = await convertGuestToUser(guestUuid, {
          email,
          login,
          oauthData: {
            googleEmail: email,
            googleSub,
            googleOAuthEnabled: true,
            password: null,
          },
        });
        
        if (convertedUser) {
          user = convertedUser;
          res.clearCookie('log___sf_21s_t1');
        }
      }
      
      if (!user) {
        const baseLogin = given_name || email.split('@')[0] || 'user';
        const login = await generateUniqueLogin(baseLogin);
        user = await prisma.user.create({
          data: {
            login,
            googleEmail: email,
            email: email,
            googleSub,
            googleOAuthEnabled: true,
            avatarUrl: null,
            password: null,
            role: 'user', 
          },
        });
      }
    }

    if (avatarUrl) {
      const hasAvatar = Boolean(user.avatarUrl);
      const isCloud = user.avatarUrl?.includes('res.cloudinary.com');
      if (!hasAvatar || !isCloud) {
        await uploadAvatarAndUpdateUser(
          user.id,
          avatarUrl,
          `google_${googleSub}`,
        );
      }
    }

    if (user.isDeleted || !user.isActive) {
      return res
        .status(403)
        .json({ error: 'Аккаунт недоступен. Обратитесь в поддержку.' });
    }

    // Проверяем, что пользователь не является гостевым (после возможной конвертации)
    if (user.role === 'guest') {
      return res
        .status(403)
        .json({ error: 'Гостевые аккаунты не могут использовать OAuth.' });
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

    res.cookie('log___tf_12f_t2', refreshToken, getRefreshCookieOptions(false));
    return res.status(200).json({
      accessToken: accessToken,
      csrfToken: csrfToken,
      googleOAuthEnabled: user.googleOAuthEnabled,
    });
  } catch (error) {
    if (!res.headersSent) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при логине через Google',
        status: 500,
        message: 'Ошибка при логине через Google. Попробуйте позже.',
      });
    }
  }
});

export default {
  path: '/',
  router,
};
