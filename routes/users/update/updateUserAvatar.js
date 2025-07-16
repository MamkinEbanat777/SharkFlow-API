import { Router } from 'express';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import {
  findUserForAvatar,
  validateImageUrl,
  updateUserAvatar,
} from '#utils/helpers/avatarHelpers.js';
import { logUserAvatarUpdateAttempt, logUserAvatarUpdateSuccess, logUserAvatarUpdateFailure } from '#utils/loggers/authLoggers.js';

const router = Router();

router.patch('/users/avatar', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const { ipAddress, userAgent } = getRequestInfo(req);
  const { imgUrl, publicId } = req.body;

  logUserAvatarUpdateAttempt(userUuid, ipAddress, userAgent, imgUrl);

  const urlValidation = validateImageUrl(imgUrl);
  if (!urlValidation.isValid) {
    logUserAvatarUpdateFailure(userUuid, ipAddress, urlValidation.error, userAgent, imgUrl);
    return res.status(400).json({ error: urlValidation.error });
  }

  try {
    const user = await findUserForAvatar(userUuid);

    if (!user) {
      logUserAvatarUpdateFailure(userUuid, ipAddress, 'Пользователь не найден или удалён', userAgent, imgUrl);
      return res
        .status(404)
        .json({ error: 'Пользователь не найден или удалён' });
    }
    const updatedUser = await updateUserAvatar(
      userUuid,
      imgUrl,
      publicId || null,
    );

    logUserAvatarUpdateSuccess(userUuid, ipAddress, userAgent, imgUrl);
    return res.status(200).json({
      message: 'Аватар успешно обновлён',
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    logUserAvatarUpdateFailure(userUuid, ipAddress, error?.message || 'unknown error', userAgent, imgUrl);
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при обновлении аватара',
      status: 500,
      message: 'Внутренняя ошибка сервера',
    });
  }
});

export default {
  path: '/',
  router,
};
