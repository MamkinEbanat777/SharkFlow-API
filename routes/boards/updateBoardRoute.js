import { Router } from 'express';
import prisma from '../../utils/prismaConfig/prismaClient.js';
import { authenticateMiddleware } from '../../middlewares/http/authenticateMiddleware.js';
import {
  isValidUUID,
  validateBoardTitle,
  isValidColor,
  sanitizeColor,
} from '../../utils/validators/boardValidators.js';
import { logBoardUpdate } from '../../utils/loggers/boardLoggers.js';
import { getClientIP } from '../../utils/helpers/ipHelper.js';
import { handleRouteError } from '../../utils/handlers/handleRouteError.js';

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

      logBoardUpdate('Board', dataToUpdate, userUuid, ipAddress);

      return res.status(200).json({ updatedBoard: { ...dataToUpdate } });
    } catch (error) {
      handleRouteError(res, error, {
        logPrefix: 'Ошибка при обновлении доски',
        mappings: {
          P2002: { status: 409, message: 'Доска с таким названием уже существует' },
          P2025: { status: 404, message: 'Доска не найдена или доступ запрещён' },
        },
        status: 500,
        message: 'Произошла внутренняя ошибка сервера при обновлении доски',
      });
    }
  },
);

export default {
  path: '/',
  router,
};
