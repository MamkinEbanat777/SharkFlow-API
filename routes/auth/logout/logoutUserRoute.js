import { Router } from 'express';
import prisma from '../../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';

const router = Router();

router.post('/api/auth/logout', authenticateMiddleware, async (req, res) => {
  const refreshToken = req.cookies.log___tf_12f_t2;

  if (!refreshToken) {
    return res.status(204).send();
  }

  try {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });

    res.clearCookie('log___tf_12f_t2', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({ message: 'Вы успешно вышли из системы' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при попытке выйти' });
  }
});

export default {
  path: '/',
  router,
};
