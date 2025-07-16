import { Router } from 'express';
import { logMonitorCheck } from '#utils/loggers/systemLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';

const router = Router();

router.get('/monitor', async (req, res) => {
  const {ipAddress, userAgent}=getRequestInfo(req)
  try {
    logMonitorCheck(ipAddress, userAgent, 'ok');
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    logMonitorCheck(ipAddress, userAgent, 'error');
    return res.status(503).json({ status: 'error' });
  }
});

export default {
  path: '/',
  router,
}; 