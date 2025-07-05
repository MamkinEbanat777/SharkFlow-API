import { Router } from 'express';
import bot from '../../telegram/bot';

const router = Router();

router.post('/telegram/webhook', async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (e) {
    console.error(e);
    res.status(500).send('Ошибка');
  }
});

export default {
  path: '/',
  router,
};
