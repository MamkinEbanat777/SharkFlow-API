import jwt from 'jsonwebtoken';

export function authenticateMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn(`Invalid auth header from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    });
    req.userUuid = decoded.userUuid;
    next();
  } catch (error) {
    console.warn(`Invalid token from ${req.ip}: ${error.message}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
