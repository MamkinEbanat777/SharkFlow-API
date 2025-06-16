import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';

const router = Router();

router.post('/user/delete', authenticateMiddleware, async (req, res) => {
  const refreshToken = req.cookies.log___tf_12f_t2;
  const userUuid = req.userUuid;

  if (!refreshToken || !userUuid) {
    return res.status(401).json({ error: 'Нет доступа или неавторизован' });
  }

  try {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });

    await prisma.user.delete({ where: { uuid: userUuid } });

    res.clearCookie('log___tf_12f_t2', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({ message: 'Вы успешно удалили аккаунт' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при попытке удалить аккаунт' });
  }
});

export default {
  path: '/',
  router,
};
