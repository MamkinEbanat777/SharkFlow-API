import { Router } from 'express';

const router = Router();

router.get('/monitor', async (req, res) => {
  console.info('Прием проверка связи...');
  res.status(200).send('API is working');
});
export default {
  path: '/',
  router,
};
