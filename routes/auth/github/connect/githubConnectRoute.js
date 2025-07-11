import { Router } from 'express';
import axios from 'axios';
import prisma from '../../../../utils/prismaConfig/prismaClient.js';
import { getClientIP } from '../../../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../../../utils/handlers/handleRouteError.js';
import { findUserByUuid } from '../../../../utils/helpers/userHelpers.js';
import { normalizeEmail } from '../../../../utils/validators/normalizeEmail.js';
import { sendUserConfirmationCode } from '../../../../utils/helpers/sendUserConfirmationCode.js';
import { setUserTempData } from '../../../../store/userTempData.js';

const router = Router();

router.post('/api/auth/github/connect', async (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.get('user-agent') || null;
  const userUuid = req.userUuid;
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Код обязателен' });
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
    const githubIdNumber = BigInt(githubUser.id);

    if (!email) {
      return res
        .status(400)
        .json({ error: 'Не удалось получить подтверждённый email из GitHub' });
    }

    const user = await findUserByUuid(userUuid);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const existingUserWithGithubId = await prisma.user.findFirst({
      where: { githubId: githubIdNumber },
    });

    if (
      existingUserWithGithubId &&
      existingUserWithGithubId.uuid !== userUuid
    ) {
      return res.status(409).json({
        error: 'Этот GitHub аккаунт уже привязан к другому пользователю',
      });
    }

    const userGithubIdStr = user.githubId ? user.githubId.toString() : null;
    const githubIdStr = githubIdNumber.toString();

    if (userGithubIdStr && userGithubIdStr !== githubIdStr) {
      console.info(
        'user.githubId:',
        user.githubId,
        'type:',
        typeof user.githubId,
      );
      console.info(
        'githubIdNumber:',
        githubIdNumber.toString(),
        'type:',
        typeof githubIdNumber.toString(),
      );

      return res.status(409).json({
        error: 'К аккаунту уже привязан другой GitHub аккаунт',
      });
    }

    if (userGithubIdStr === githubIdStr) {
      return res
        .status(200)
        .json({ message: 'GitHub уже привязан к аккаунту' });
    }

    const normalizedUserEmail = normalizeEmail(user.email);
    const normalizedGithubEmail = normalizeEmail(email);

    if (normalizedUserEmail !== normalizedGithubEmail) {
      await sendUserConfirmationCode({
        userUuid,
        type: 'connectGithub',
        email: normalizedGithubEmail,
        skipUserCheck: true,
        loggers: {
          success: () => {},
          failure: () => {},
        },
      });

      await setUserTempData('connectGithub', userUuid, {
        githubId: githubIdNumber,
        normalizedGithubEmail,
      });

      return res.status(200).json({
        message:
          'Email GitHub не совпадает с email аккаунта. Требуется подтверждение.',
        requireEmailConfirmed: true,
      });
    }

    await prisma.user.update({
      where: { uuid: userUuid },
      data: {
        githubId: githubIdNumber,
        githubOAuthEnabled: true,
      },
    });

    return res.status(200).json({ message: 'Github-аккаунт успешно привязан' });
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
