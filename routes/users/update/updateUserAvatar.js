import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import { getClientIP } from '../../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import { findUserForAvatar, validateImageUrl, updateUserAvatar } from '../../../utils/helpers/avatarHelpers.js';

const router = Router();

router.patch('/api/users/avatar', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);
  const { imgUrl, publicId } = req.body;

  const urlValidation = validateImageUrl(imgUrl);
  if (!urlValidation.isValid) {
    return res.status(400).json({ error: urlValidation.error });
  }

  try {
    const user = await findUserForAvatar(userUuid);

    if (!user) {
      return res
        .status(404)
        .json({ error: 'Пользователь не найден или удалён' });
    }

    const updatedUser = await updateUserAvatar(userUuid, imgUrl, publicId || null);

    console.log(
      `Аватар обновлён для пользователя ${userUuid} с IP ${ipAddress}`,
    );

    res.status(200).json({
      message: 'Аватар успешно обновлён',
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
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
