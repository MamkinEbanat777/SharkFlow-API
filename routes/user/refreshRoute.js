import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  // console.log(refreshToken);
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token отсутствует' });
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { userUuid: payload.userUuid },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' },
    );

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
