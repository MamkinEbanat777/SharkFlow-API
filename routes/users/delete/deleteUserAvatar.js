import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import cloudinary from 'cloudinary';
import { handleRouteError } from '../../../utils/handlers/handleRouteError.js';

const router = Router();

router.delete('/api/users/avatar', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid, isDeleted: false },
      select: { avatarUrl: true, publicId: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user?.publicId) {
      await cloudinary.v2.uploader.destroy(user.publicId);
    }

    const existingUser = await prisma.user.findFirst({
      where: { uuid: userUuid, isDeleted: false },
      select: { id: true, publicId: true },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { avatarUrl: null, publicId: null },
    });

    res.status(200).json({
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
