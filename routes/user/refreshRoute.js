import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createAccessToken } from '../../utils/tokens/accessToken.js';

const router = Router();

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.tf__2;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: 'Сессия истекла. Пожалуйста войдите снова' });
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = createAccessToken(payload.userUuid);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
