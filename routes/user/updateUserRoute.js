import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { normalizeUserData } from '../../utils/validators/normalizeLoginAndEmail.js';

const router = Router();

router.patch('/user/update', authenticateMiddleware, async (req, res) => {
  try {
    const userUuid = req.userUuid;
    if (!userUuid) {
      return res
        .status(400)
        .json({ error: 'UUID пользователя не найден в токене' });
    }

    const { login, email } = req.body;

    const normalizedData = normalizeUserData({ email, login });

    if (!normalizedData) {
      return res.status(400).json({ error: 'Некорректный email или логин' });
    }

    const dataToUpdate = {};

    if (normalizedData.login) {
      dataToUpdate.login = normalizedData.login;
    }

    if (normalizedData.email) {
      dataToUpdate.email = normalizedData.email;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    const updatedUser = await prisma.user.update({
      where: { uuid: userUuid },
      data: dataToUpdate,
      select: { login: true, email: true },
    });

    res.json({ user: updatedUser });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Почта или логин уже занят' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    console.error('Ошибка обновления пользователя:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
