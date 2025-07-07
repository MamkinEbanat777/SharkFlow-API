import jwt from 'jsonwebtoken';
import { isValidUUID } from '../../utils/validators/boardValidators.js';

export function authenticateMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const csrfHeader = req.headers['x-csrf-token'];
  console.log(req.headers);

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

    if (!csrfHeader) {
      console.error(`Missing CSRF token from ${req.ip}`);
      return res.status(403).json({ error: 'Missing CSRF token' });
    }

    try {
      const csrfPayload = jwt.verify(csrfHeader, process.env.JWT_CSRF_SECRET, {
        algorithms: ['HS256'],
      });

      if (csrfPayload.userUuid !== decoded.userUuid) {
        console.error(`CSRF token mismatch from ${req.ip}`);
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
    } catch (csrfErr) {
      console.error(`Invalid CSRF token from ${req.ip}: ${csrfErr.message}`);
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    req.userUuid = decoded.userUuid;
    req.userRole = decoded.role || 'user';
    next();
  } catch (error) {
    console.error(`Invalid token from ${req.ip}: ${error.message}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
