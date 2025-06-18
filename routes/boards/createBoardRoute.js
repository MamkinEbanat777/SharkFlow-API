import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import { 
  validateBoardTitle, 
  isValidColor, 
  sanitizeColor 
} from '../../utils/validators/boardValidators.js';
import { 
  checkBoardCreationRateLimit, 
  incrementBoardCreationAttempts 
} from '../../utils/rateLimiters/boardRateLimiters.js';
import { logBoardCreation } from '../../utils/loggers/boardLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';

const router = Router();

router.post('/api/boards', authenticateMiddleware, async (req, res) => {
  const userUuid = req.userUuid;
  const ipAddress = getClientIP(req);

  
  const rateLimitCheck = checkBoardCreationRateLimit(userUuid);
  if (rateLimitCheck.blocked) {
    return res.status(429).json({ 
      error: `Слишком много попыток создания досок. Попробуйте через ${rateLimitCheck.timeLeft} секунд` 
    });
  }

  
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
    return res.status(400).json({ error: 'Неверный формат цвета (используйте hex формат)' });
  }

  try {
    
    const boardCount = await prisma.board.count({
      where: { user: { uuid: userUuid } }
    });

    const MAX_BOARDS_PER_USER = 50;
    if (boardCount >= MAX_BOARDS_PER_USER) {
      return res.status(400).json({ 
        error: `Достигнут лимит досок (${MAX_BOARDS_PER_USER}). Удалите некоторые доски для создания новых.` 
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
        isFavorite: true
      }
    });

    
    incrementBoardCreationAttempts(userUuid);

    
    logBoardCreation(title, userUuid, ipAddress);

    return res.status(201).json({
      message: 'Доска успешно создана',
      board: newBoard,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (error.code === 'P2002') {
      return res
        .status(409)
        .json({ error: 'У вас уже есть доска с таким названием' });
    }

    console.error('Ошибка при создании доски:', error);
    return res
      .status(500)
      .json({ error: 'Произошла внутренняя ошибка сервера. Попробуйте позже' });
  }
});

export default {
  path: '/',
  router,
};
