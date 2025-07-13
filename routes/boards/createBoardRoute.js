import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import {
  validateBoardTitle,
  isValidColor,
  sanitizeColor,
} from '../../utils/validators/boardValidators.js';
import { logBoardCreation } from '../../utils/loggers/boardLoggers.js';
import { getClientIP } from '../../utils/helpers/authHelpers.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';
import { getUserBoardCount } from '../../utils/helpers/boardHelpers.js';

const router = Router();

router.post('/boards', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);

  const rawTitle = req.body.title;
  const rawColor = req.body.color;

  if (!rawTitle || typeof rawTitle !== 'string') {
    return res.status(400).json({ error: 'Название доски обязательно' });
  }

  if (!rawColor || typeof rawColor !== 'string') {
    return res.status(400).json({ error: 'Цвет доски обязателен' });
  }

  const titleValidation = validateBoardTitle(rawTitle);
  if (!titleValidation.isValid) {
    return res.status(400).json({ error: titleValidation.error });
  }
  const title = titleValidation.value;

  const color = sanitizeColor(rawColor);
  if (!isValidColor(color)) {
    return res
      .status(400)
      .json({ error: 'Неверный формат цвета (используйте hex формат)' });
  }

  try {
    const boardCount = await getUserBoardCount(userUuid);

    const MAX_BOARDS_PER_USER = 100;
    if (boardCount >= MAX_BOARDS_PER_USER) {
      return res.status(400).json({
        error: `Достигнут лимит досок (${MAX_BOARDS_PER_USER}). Удалите некоторые доски для создания новых.`,
      });
    }

    const newBoard = await prisma.board.create({
      data: {
        title,
        color,
        user: { connect: { uuid: userUuid } },
      },
      select: {
        uuid: true,
        title: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        isPinned: true,
        isFavorite: true,
      },
    });

    logBoardCreation(title, userUuid, ipAddress);

    return res.status(201).json({
      message: 'Доска успешно создана',
      board: newBoard,
    });
  } catch (error) {
    handleRouteError(res, error, {
      logPrefix: 'Ошибка при создании доски',
      mappings: {
        P2002: {
          status: 409,
          message: 'Доска с таким названием уже существует',
        },
        P2025: { status: 404, message: 'Пользователь не найден' },
      },
      status: 500,
      message: 'Произошла внутренняя ошибка сервера при создании доски',
    });
  }
});

export default {
  path: '/',
  router,
};
