import { Router } from 'express';

const router = Router();

router.get('/monitor', async (req, res) => {
  try {
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    return res.status(503).json({ status: 'error' });
  }
});

export default {
  path: '/',
  router,
}; 