import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  res.status(200).send('API is working');
  console.log('Прием проверка связи...');
});
export default {
  path: '/',
  router,
};
