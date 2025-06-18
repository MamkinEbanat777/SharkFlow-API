import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { 
  checkBoardFetchRateLimit, 
  incrementBoardFetchAttempts 
} from '../../utils/rateLimiters/boardRateLimiters.js';
import { validatePaginationParams } from '../../utils/validators/boardValidators.js';
import { logBoardFetch } from '../../utils/loggers/boardLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';

const router = Router();

router.get('/api/boards', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);

  
  const rateLimitCheck = checkBoardFetchRateLimit(userUuid);
  if (rateLimitCheck.blocked) {
    return res.status(429).json({ 
      error: `Слишком много запросов. Попробуйте через ${rateLimitCheck.timeLeft} секунд` 
    });
  }

  
  const { page, limit } = validatePaginationParams(req.query.page, req.query.limit);
  const offset = (page - 1) * limit;

  try {
    
    const [boards, totalBoards] = await Promise.all([
      
      prisma.board.findMany({
        where: { user: { uuid: userUuid } },
        orderBy: [
          { isPinned: 'desc' },
          { isFavorite: 'desc' },
          { updatedAt: 'desc' }
        ],
        skip: offset,
        take: limit,
        select: {
          uuid: true,
          title: true,
          color: true,
          createdAt: true,
          updatedAt: true,
          isPinned: true,
          isFavorite: true,
          _count: {
            select: {
              tasks: true
            }
          }
        }
      }),
      
      prisma.board.count({
        where: { user: { uuid: userUuid } }
      })
    ]);

    
    incrementBoardFetchAttempts(userUuid);

    
    logBoardFetch(boards.length, totalBoards, userUuid, ipAddress);

    
    const totalPages = Math.ceil(totalBoards / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      boards: boards.map(board => ({
        uuid: board.uuid,
        title: board.title,
        color: board.color,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        isPinned: board.isPinned,
        isFavorite: board.isFavorite,
        taskCount: board._count.tasks
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalBoards,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error('Ошибка при загрузке досок:', error);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера' });
  }
});

export default {
  path: '/',
  router,
};
