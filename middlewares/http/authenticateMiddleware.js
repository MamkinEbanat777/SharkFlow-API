import jwt from 'jsonwebtoken';
import { isValidUUID } from '#utils/validators/boardValidators.js';
import { logAuthMiddlewareError } from '#utils/loggers/middlewareLoggers.js';

export function authenticateMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logAuthMiddlewareError('invalidHeader', req.ip, new Error('Invalid auth header'));
    return res.status(401).json({ error: 'Недействительный заголовок авторизации' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    });

    if (!isValidUUID(decoded.userUuid)) {
      logAuthMiddlewareError('invalidUserUuid', req.ip, new Error('Invalid userUuid in token'));
      return res.status(401).json({ error: 'Недействительный токен' });
    }

    if (!csrfHeader) {
      logAuthMiddlewareError('missingCsrf', req.ip, new Error('Missing CSRF token'));
      return res.status(401).json({ error: 'Отсутствует CSRF токен' });
    }

    try {
      const csrfPayload = jwt.verify(csrfHeader, process.env.JWT_CSRF_SECRET, {
        algorithms: ['HS256'],
      });

      if (csrfPayload.userUuid !== decoded.userUuid) {
        logAuthMiddlewareError('csrfMismatch', req.ip, new Error('CSRF token mismatch'));
        return res.status(401).json({ error: 'Недействительный CSRF токен' });
      }
    } catch (csrfErr) {
      logAuthMiddlewareError('invalidCsrf', req.ip, csrfErr);
      return res.status(401).json({ error: 'Недействительный CSRF токен' });
    }

    req.userUuid = decoded.userUuid;
    req.userRole = decoded.role || 'user';
    next();
  } catch (error) {
    logAuthMiddlewareError('invalidToken', req.ip, error);
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}
