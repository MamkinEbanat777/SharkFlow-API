import { Router } from 'express';
import { getClientIP } from '../../../../utils/helpers/authHelpers.js';
import { OAuth2Client } from 'google-auth-library';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { authenticateMiddleware } from '../../../../middlewares/http/authenticateMiddleware.js';
import { normalizeEmail } from '../../../../utils/validators/normalizeEmail.js';
import { sendUserConfirmationCode } from '../../../../utils/helpers/sendUserConfirmationCode.js';
import { setUserTempData } from '../../../../store/userTempData.js';
import { findUserByUuid } from '../../../../utils/helpers/userHelpers.js';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';

const router = Router();

const oauth2Client = new OAuth2Client(
  process.env.CLIENT_GOOGLE_ID,
  process.env.CLIENT_GOOGLE_SECRET,
  'postmessage',
);

router.post(
  '/auth/google/connect',
  authenticateMiddleware,
  async (req, res) => {
    const ipAddress = getClientIP(req);
    const userAgent = req.get('user-agent') || null;
    const userUuid = req.userUuid;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Код обязателен' });
    }

    try {
      const { tokens: googleTokens } = await oauth2Client.getToken({
        code,
        redirect_uri: 'postmessage',
      });

      const ticket = await oauth2Client.verifyIdToken({
        idToken: googleTokens.id_token,
        audience: process.env.CLIENT_GOOGLE_ID,
      });

      const payload = ticket.getPayload();
      const googleSub = payload.sub;
      const email = payload.email;
      const emailVerified = payload.email_verified;
      //   const given_name = payload.given_name;
      //   let avatarUrl = payload.picture;

      if (!googleSub) {
        return res.status(400).json({ error: 'Некорректный токен Google' });
      }

      if (!email || !emailVerified) {
        return res.status(400).json({
          error: 'Некорректный или неподтверждённый email Google',
        });
      }

      const user = await findUserByUuid(userUuid);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const normalizedUserEmail = normalizeEmail(user.email);
      const normalizedGoogleEmail = normalizeEmail(email);

      const existingUserWithGoogleSub = await prisma.user.findFirst({
        where: { googleSub: googleSub },
      });

      if (
        existingUserWithGoogleSub &&
        existingUserWithGoogleSub.uuid !== userUuid
      ) {
        return res.status(409).json({
          error: 'Этот Google аккаунт уже привязан к другому пользователю',
        });
      }

      if (user.googleSub && user.googleSub !== googleSub) {
        return res.status(409).json({
          error: 'К аккаунту уже привязан другой Google аккаунт',
        });
      }

      if (user.googleSub === googleSub) {
        return res
          .status(200)
          .json({ message: 'Google уже привязан к аккаунту' });
      }

      if (normalizedUserEmail !== normalizedGoogleEmail) {
        await sendUserConfirmationCode({
          userUuid,
          type: 'connectGoogle',
          email: normalizedGoogleEmail,
          skipUserCheck: true,
          loggers: {
            success: () => {},
            failure: () => {},
          },
        });

        await setUserTempData('connectGoogle', userUuid, {
          googleSub,
          normalizedGoogleEmail,
        });

        return res.status(200).json({
          message:
            'Email Google не совпадает с email аккаунта. Требуется подтверждение.',
          requireEmailConfirmed: true,
        });
      }

      await prisma.user.update({
        where: { uuid: userUuid },
        data: {
          googleSub,
          googleOAuthEnabled: true,
        },
      });

      return res
        .status(200)
        .json({ message: 'Google-аккаунт успешно привязан' });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при подключении Google-аккаунта',
        status: 500,
        message: 'Не удалось привязать Google. Попробуйте позже.',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
