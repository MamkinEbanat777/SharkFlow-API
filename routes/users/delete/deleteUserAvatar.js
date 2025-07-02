import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import cloudinary from 'cloudinary';

const router = Router();

router.delete('/api/users/avatar', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid, isDeleted: false },
      select: { avatarUrl: true, publicId: true },
    });

    if (user?.publicId) {
      await cloudinary.v2.uploader.destroy(user.publicId);
    }

    await prisma.user.update({
      where: { uuid: userUuid, isDeleted: false },
      data: { avatarUrl: null, publicId: null },
    });

    res.status(200).json({
      message: 'Аватар успешно удалён',
});
  } catch (error) {
    console.error('Ошибка при удалении аватара:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
