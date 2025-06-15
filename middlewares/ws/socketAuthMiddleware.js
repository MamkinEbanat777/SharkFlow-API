import jwt from 'jsonwebtoken';

export function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Unauthorized: token missing'));
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (!payload || !payload.userUuid) {
      return next(new Error('Unauthorized: invalid token payload'));
    }

    socket.userUuid = payload.userUuid;

    next();
  } catch (error) {
    next(new Error('Unauthorized: ' + error.message));
  }
}
