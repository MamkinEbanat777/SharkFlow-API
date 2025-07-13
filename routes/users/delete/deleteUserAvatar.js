import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import cloudinary from 'cloudinary';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';
import {
  findUserForAvatar,
  clearUserAvatar,
} from '../../../utils/helpers/avatarHelpers.js';

const router = Router();

router.delete('/users/avatar', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  try {
    const user = await findUserForAvatar(userUuid, {
      avatarUrl: true,
      publicId: true,
    });

    if (!user) {
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
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await clearUserAvatar(existingUser.id);

    return res.status(200).json({
      message: 'Аватар успешно удалён',
    });
  } catch (error) {
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
