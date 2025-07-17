import { Router } from 'express';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import bot from '#telegramBot/bot.js';
import { logTelegramCommand, logTelegramWebhookAttempt } from '#utils/loggers/telegramLoggers.js';

const router = Router();

router.post('/telegram/webhook', async (req, res) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  logTelegramWebhookAttempt('webhook', ipAddress, userAgent);
  const updateData = req.body;

  try {
    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Некорректные данные webhook',
      });
    }

    const updateId = updateData.update_id;
    if (!updateId) {
      return res.status(400).json({
        success: false,
        message: 'Отсутствует update_id',
      });
    }

    logTelegramCommand('webhook', updateId.toString(), ipAddress);
    await bot.handleUpdate(updateData);

    return res.status(200).json({
      success: true,
      message: 'Webhook обработан успешно',
    });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка обработки Telegram webhook',
      status: 500,
      message: 'Произошла ошибка при обработке webhook',
    });
  }
});

export default {
  path: '/',
  router,
};
