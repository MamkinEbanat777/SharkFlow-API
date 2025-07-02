import { Router } from 'express';

const router = Router();

router.get('/monitor', async (req, res) => {
  res.status(200).send('API is working');
  console.info('Прием проверка связи...');
});
export default {
  path: '/',
  router,
};
