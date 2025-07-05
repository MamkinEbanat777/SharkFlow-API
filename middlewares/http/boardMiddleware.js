import { isValidUUID } from '../../utils/validators/boardValidators.js';
import { getClientIP } from '../../utils/helpers/authHelpers.js';

export const validateBoardUuid = (req, res, next) => {
  const { boardUuid } = req.params;
  
  if (!isValidUUID(boardUuid)) {
    return res
      .status(400)
      .json({ error: 'Неверный формат идентификатора доски' });
  }
  
  next();
};

export const addBoardContext = (req, res, next) => {
  req.boardContext = {
    userUuid: req.userUuid,
    ipAddress: getClientIP(req),
  };
  next();
}; 
