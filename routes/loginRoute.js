import { Router } from 'express';
import { loginValidate } from '../utils/validators/loginValidate.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import prisma from '../utils/prismaClient.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/login', validateMiddleware(loginValidate), async (req, res) => {
  const { user } = req.validatedBody;
  const { email, password, rememberMe } = user;
  // console.log(req.validatedBody);
  try {
    const getUser = await prisma.user.findFirst({
      where: { email },
    });

    if (!getUser) {
      return res
        .status(401)
        .json({ error: 'Пользователь с таким email не найден' });
    }

    const isPasswordValid = await bcrypt.compare(password, getUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const accessToken = jwt.sign(
      { userUuid: getUser.uuid },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign(
      { userUuid: getUser.uuid },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: rememberMe ? '30d' : '1d' },
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({
      accessToken,
      message: `Добро пожаловать! ${getUser.login}`,
    });
  } catch (error) {
    console.error('Ошибка при логине:', error);
    res.status(500).json({ error: 'Ошибка сервера при логине' });
  }
});

export default {
  path: '/',
  router,
};
