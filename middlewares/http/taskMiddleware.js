import { isValidUUID } from '../../utils/validators/boardValidators.js';
import { getRequestInfo } from '../../utils/helpers/authHelpers.js';

export const validateTaskUuids = (req, res, next) => {
  const { boardUuid, taskUuid } = req.params;
  
  if (!isValidUUID(boardUuid)) {
    return res.status(400).json({ error: 'Неверный формат идентификатора доски' });
  }
  
  if (taskUuid && !isValidUUID(taskUuid)) {
    return res.status(400).json({ error: 'Неверный формат идентификатора задачи' });
  }
  
  next();
};

export const addTaskContext = (req, res, next) => {
  const { ipAddress } = getRequestInfo(req);
  req.taskContext = {
    userUuid: req.userUuid,
    ipAddress,
  };
  next();
}; 