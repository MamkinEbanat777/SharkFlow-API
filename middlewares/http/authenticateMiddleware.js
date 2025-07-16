import jwt from 'jsonwebtoken';
import { isValidUUID } from '#utils/validators/boardValidators.js';
import { logAuthMiddlewareError } from '#utils/loggers/middlewareLoggers.js';
import { getRequestInfo } from '#utils/helpers/authHelpers.js';

export function authenticateMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const csrfHeader = req.headers['x-csrf-token'];
  const { ipAddress, userAgent } = getRequestInfo(req);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logAuthMiddlewareError('invalidHeader', ipAddress, userAgent, new Error('Invalid auth header'));
    return res.status(401).json({ error: 'Недействительный заголовок авторизации' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    });

    if (!isValidUUID(decoded.userUuid)) {
      logAuthMiddlewareError('invalidUserUuid', ipAddress, userAgent, new Error('Invalid userUuid in token'));
      return res.status(401).json({ error: 'Недействительный токен' });
    }

    if (!csrfHeader) {
      logAuthMiddlewareError('missingCsrf', ipAddress, userAgent, new Error('Missing CSRF token'));
      return res.status(401).json({ error: 'Отсутствует CSRF токен' });
    }

    try {
      const csrfPayload = jwt.verify(csrfHeader, process.env.JWT_CSRF_SECRET, {
        algorithms: ['HS256'],
      });

      if (csrfPayload.userUuid !== decoded.userUuid) {
        logAuthMiddlewareError('csrfMismatch', ipAddress, userAgent, new Error('CSRF token mismatch'));
        return res.status(401).json({ error: 'Недействительный CSRF токен' });
      }
    } catch (csrfErr) {
      logAuthMiddlewareError('invalidCsrf', ipAddress, userAgent, csrfErr);
      return res.status(401).json({ error: 'Недействительный CSRF токен' });
    }

    req.userUuid = decoded.userUuid;
    req.userRole = decoded.role || 'user';
    next();
  } catch (error) {
    logAuthMiddlewareError('invalidToken', ipAddress, userAgent, error);
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}
