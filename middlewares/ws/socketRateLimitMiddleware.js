const connectionAttempts = new Map();

export function socketRateLimitMiddleware(socket, next) {
  const ip = socket.handshake.address;
  const now = Date.now();

  if (!connectionAttempts.has(ip)) {
    connectionAttempts.set(ip, []);
  }

  const timestamps = connectionAttempts
    .get(ip)
    .filter((ts) => now - ts < 10_000);
  timestamps.push(now);

  connectionAttempts.set(ip, timestamps);

  if (timestamps.length > 5) {
    return next(new Error('Too many connection attempts'));
  }

  next();
}
