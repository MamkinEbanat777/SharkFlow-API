import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
// import { validatePaginationParams } from '../../utils/validators/boardValidators.js';
import { logBoardFetch } from '../../utils/loggers/boardLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';

const router = Router();

router.get('/api/boards', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);

  // const { page, limit } = validatePaginationParams(
  //   req.query.page,
  //   req.query.limit,
  // );
  // const offset = (page - 1) * limit;

  try {
    const [boards, totalBoards] = await Promise.all([
      prisma.board.findMany({
        where: { isDeleted: false, user: { uuid: userUuid } },
        orderBy: [
          { isPinned: 'desc' },
          { isFavorite: 'desc' },
          { updatedAt: 'desc' },
        ],
        // skip: offset,
        // take: limit,
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
              tasks: true,
            },
          },
        },
      }),

      prisma.board.count({
        where: { isDeleted: false, user: { uuid: userUuid } },
      }),
    ]);

    logBoardFetch(boards.length, totalBoards, userUuid, ipAddress);

    // const totalPages = Math.ceil(totalBoards / limit);
    // const hasNextPage = page < totalPages;
    // const hasPrevPage = page > 1;

    res.json({
      boards: boards.map((board) => ({
        uuid: board.uuid,
        title: board.title,
        color: board.color,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        isPinned: board.isPinned,
        isFavorite: board.isFavorite,
        taskCount: board._count.tasks,
      })),
      // pagination: {
      //   currentPage: page,
      //   totalPages,
      //   totalBoards,
      //   hasNextPage,
      //   hasPrevPage,
      //   limit,
      // },
    });
  } catch (error) {
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
