import prisma from '../prismaConfig/prismaClient.js';

export const findBoardByUuid = async (boardUuid, userUuid, select = {}) => {
  return await prisma.board.findFirst({
    where: {
      uuid: boardUuid,
      user: { uuid: userUuid, isDeleted: false },
      isDeleted: false,
    },
    ...(Object.keys(select).length > 0 ? { select } : {}),
  });
};

export const getUserBoardCount = async (userUuid) => {
  return await prisma.board.count({
    where: { user: { uuid: userUuid } },
  });
};

export const getBoardsWithTaskCounts = async (userUuid) => {
  const [boards, totalBoards] = await Promise.all([
    prisma.board.findMany({
      where: { isDeleted: false, user: { uuid: userUuid } },
      orderBy: [
        { isPinned: 'desc' },
        { isFavorite: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: {
        id: true,
        uuid: true,
        title: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        isPinned: true,
        isFavorite: true,
      },
    }),
    prisma.board.count({
      where: { isDeleted: false, user: { uuid: userUuid } },
    }),
  ]);

  let counts = [];
  if (boards.length > 0) {
    const boardUuids = boards.map((b) => b.uuid);
    counts = await prisma.task.groupBy({
      by: ['boardId'],
      where: {
        isDeleted: false,
        board: { uuid: { in: boardUuids } },
      },
      _count: { _all: true },
    });
  }

  const countMap = counts.reduce((acc, { boardId, _count }) => {
    acc[boardId] = _count._all;
    return acc;
  }, {});

  return {
    boards: boards.map((b) => ({
      uuid: b.uuid,
      title: b.title,
      color: b.color,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      isPinned: b.isPinned,
      isFavorite: b.isFavorite,
      taskCount: countMap[b.id] ?? 0,
    })),
    totalBoards,
  };
};

export const softDeleteBoardWithTasks = async (boardId) => {
  return await prisma.$transaction([
    prisma.board.update({
      where: { id: boardId },
      data: { isDeleted: true, deletedAt: new Date() },
    }),
    prisma.task.updateMany({
      where: { boardId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    }),
  ]);
}; 
