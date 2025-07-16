import { Router } from 'express';
import { authenticateMiddleware } from '#middlewares/http/authenticateMiddleware.js';
import { logBoardFetch } from '#utils/loggers/boardLoggers.js';
import { logBoardFetchAttempt } from '#utils/loggers/boardLoggers.js';
import { logBoardFetchFailure } from '#utils/loggers/boardLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';
import { handleRouteError } from '#utils/handlers/handleRouteError.js';
import { getBoardsWithTaskCounts } from '#utils/helpers/boardHelpers.js';

const router = Router();

router.get('/boards', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const { ipAddress, userAgent } = getRequestInfo(req);

  logBoardFetchAttempt(userUuid, ipAddress, userAgent);

  try {
    const { boards, totalBoards } = await getBoardsWithTaskCounts(userUuid);

    logBoardFetch(boards.length, totalBoards, userUuid, ipAddress);

    return res.json({
      boards,
      totalBoards,
    });
  } catch (error) {
    logBoardFetchFailure(userUuid, ipAddress, error);
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при получении досок',
      status: 500,
      message: 'Произошла внутренняя ошибка сервера при получении досок',
    });
  }
});

export default {
  path: '/',
  router,
};
