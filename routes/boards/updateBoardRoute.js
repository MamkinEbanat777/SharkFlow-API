import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import {
  isValidUUID,
  validateBoardTitle,
  isValidColor,
  sanitizeColor,
} from '../../utils/validators/boardValidators.js';
import {
  checkBoardUpdateRateLimit,
  incrementBoardUpdateAttempts,
} from '../../utils/rateLimiters/boardRateLimiters.js';
import { logBoardUpdate } from '../../utils/loggers/boardLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';

const router = Router();

router.patch(
  '/api/boards/:boardUuid',
  authenticateMiddleware,
  async (req, res) => {
    const userUuid = req.userUuid;
    const { boardUuid } = req.params;
    const ipAddress = getClientIP(req);

    if (!isValidUUID(boardUuid)) {
      return res
        .status(400)
        .json({ error: 'Неверный формат идентификатора доски' });
    }

    const rateLimitCheck = checkBoardUpdateRateLimit(userUuid);
    if (rateLimitCheck.blocked) {
      return res.status(429).json({
        error: `Слишком много попыток обновления досок. Попробуйте через ${rateLimitCheck.timeLeft} секунд`,
      });
    }

    let { title, color, isPinned, isFavorite } = req.body;
    const dataToUpdate = {};

    try {
      if (title !== undefined) {
        if (typeof title !== 'string') {
          return res
            .status(400)
            .json({ error: 'Название должно быть строкой' });
        }

        const titleValidation = validateBoardTitle(title);
        if (!titleValidation.isValid) {
          return res.status(400).json({ error: titleValidation.error });
        }
        dataToUpdate.title = titleValidation.value;
      }

      if (color !== undefined) {
        if (typeof color !== 'string') {
          return res.status(400).json({ error: 'Цвет должен быть строкой' });
        }

        const sanitizedColor = sanitizeColor(color);
        if (!isValidColor(sanitizedColor)) {
          return res
            .status(400)
            .json({ error: 'Неверный формат цвета (используйте hex формат)' });
        }
        dataToUpdate.color = sanitizedColor;
      }

      if (isPinned !== undefined) {
        if (typeof isPinned !== 'boolean') {
          return res
            .status(400)
            .json({ error: 'Поле isPinned должно быть boolean' });
        }
        dataToUpdate.isPinned = isPinned;
      }

      if (isFavorite !== undefined) {
        if (typeof isFavorite !== 'boolean') {
          return res
            .status(400)
            .json({ error: 'Поле isFavorite должно быть boolean' });
        }
        dataToUpdate.isFavorite = isFavorite;
      }

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }

      const updatedBoard = await prisma.board.updateMany({
        where: {
          isDeleted: false,
          uuid: boardUuid,
          user: { uuid: userUuid },
        },
        data: dataToUpdate,
      });

      if (updatedBoard.count === 0) {
        return res.status(404).json({
          error: 'Доска не найдена или не принадлежит пользователю',
        });
      }

      incrementBoardUpdateAttempts(userUuid);

      logBoardUpdate('Board', dataToUpdate, userUuid, ipAddress);

      res.status(200).json({
        message: 'Доска успешно обновлена',
        updated: {
          uuid: boardUuid,
          ...dataToUpdate,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res
          .status(409)
          .json({ error: 'У вас уже есть доска с таким названием' });
      }
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Доска не найдена или доступ запрещён' });
      }
      console.error('Ошибка обновления доски:', error);
      return res
        .status(500)
        .json({ error: 'Произошла внутренняя ошибка сервера' });
    }
  },
);

export default {
  path: '/',
  router,
};
