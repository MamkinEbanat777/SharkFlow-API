import { Router } from 'express';
import bot from '../../telegram/bot.js';

const router = Router();

router.post('/telegram/webhook', async (req, res) => {
  try {
    console.log('Webhook получил данные:', req.body);
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
