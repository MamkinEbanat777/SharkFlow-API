import { Router } from 'express';
import { loginValidate } from '../../utils/validators/loginValidate.js';
import { validateMiddleware } from '../../middlewares/http/validateMiddleware.js';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import bcrypt from 'bcrypt';
import { createAccessToken } from '../../utils/tokens/accessToken.js';
import { createRefreshToken } from '../../utils/tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../../utils/cookie/loginCookie.js';

const router = Router();

router.post('/login', validateMiddleware(loginValidate), async (req, res) => {
  const { user } = req.validatedBody;
  const { email, password, rememberMe } = user;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Неправильный email или пароль' });
    }

    const accessToken = createAccessToken(user.uuid);
    const refreshToken = createRefreshToken(user.uuid, rememberMe);

    res.cookie('tf__2', refreshToken, getRefreshCookieOptions(rememberMe));

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Ошибка при логине:', error);
    res.status(500).json({ error: 'Ошибка сервера при логине' });
  }
});

export default {
  path: '/',
  router,
};
