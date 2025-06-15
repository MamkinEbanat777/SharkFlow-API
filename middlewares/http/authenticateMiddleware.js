import jwt from 'jsonwebtoken';

export function authenticateMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token' });
  try {
    const { userUuid } = jwt.verify(
      h.split(' ')[1],
      process.env.JWT_ACCESS_SECRET,
    );
    req.userUuid = userUuid;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
