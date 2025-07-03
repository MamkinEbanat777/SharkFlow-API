import jwt from 'jsonwebtoken';
import { isValidUUID } from '../../utils/validators/boardValidators.js';

export function authenticateMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.error(`Invalid auth header from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    });
    if (!isValidUUID(decoded.userUuid)) {
      console.error(`Invalid userUuid in token from ${req.ip}`);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userUuid = decoded.userUuid;
    req.userRole = decoded.role || 'user';
    next();
  } catch (error) {
    console.error(`Invalid token from ${req.ip}: ${error.message}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
