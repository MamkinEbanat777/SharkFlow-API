import { Router } from 'express';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';

const router = Router();

router.get('/monitor', async (req, res) => {
  console.info(
    `[Monitor] Получен запрос от ${req.ip} ${new Date().toISOString()}`,
  );

  try {
    return res.status(200).send('API is working');
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка мониторинга',
      status: 500,
      message: 'Произошла внутренняя ошибка сервера мониторинга',
    });
  }
});

export default {
  path: '/',
  router,
};
