import { Router } from 'express';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import cloudinary from 'cloudinary';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import {
  findUserForAvatar,
  clearUserAvatar,
} from '#utils/helpers/avatarHelpers.js';
import { logUserAvatarDeleteAttempt, logUserAvatarDeleteSuccess, logUserAvatarDeleteFailure } from '#utils/loggers/authLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';

const router = Router();

router.delete('/users/avatar', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const {ipAddress, userAgent} = getRequestInfo(req)

  logUserAvatarDeleteAttempt(userUuid, ipAddress, userAgent);

  try {
    const user = await findUserForAvatar(userUuid, {
      avatarUrl: true,
      publicId: true,
    });

    if (!user) {
      logUserAvatarDeleteFailure(userUuid, ipAddress, 'Пользователь не найден', userAgent);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user?.publicId) {
      await cloudinary.v2.uploader.destroy(user.publicId);
    }

    const existingUser = await findUserForAvatar(userUuid, {
      id: true,
      publicId: true,
    });

    if (!existingUser) {
      logUserAvatarDeleteFailure(userUuid, ipAddress, 'Пользователь не найден', userAgent);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await clearUserAvatar(existingUser.id);

    logUserAvatarDeleteSuccess(userUuid, ipAddress, userAgent);
    return res.status(200).json({
      message: 'Аватар успешно удалён',
    });
  } catch (error) {
    logUserAvatarDeleteFailure(userUuid, ipAddress, error?.message || 'unknown error', userAgent);
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при удалении аватара',
      status: 500,
      message: 'Произошла внутренняя ошибка сервера при удалении аватара',
    });
  }
});

export default {
  path: '/',
  router,
};
