const lastRequestTime = new Map();
const violationCounts = new Map();
const bannedClients = new Map();

const INTERVAL_MS = 2000;
const BAN_TIME_MS = 1 * 60 * 1000;
const MAX_VIOLATIONS = 20;

function getClientKey(req) {
  const ip = req.ip || 'unknown_ip';
  const ua = req.headers['user-agent'];

  return `${ip}::${ua}`;
}

export function limiterMiddleware(req, res, next) {
  const key = getClientKey(req);
  const now = Date.now();

  if (bannedClients.has(key)) {
    const banExpires = bannedClients.get(key);
    if (now < banExpires) {
      return res.status(429).json({
        error: 'Слишком много запросов. Подождите немного и попробуйте снова',
        code: 429,
      });
    } else {
      bannedClients.delete(key);
      violationCounts.delete(key);
      lastRequestTime.delete(key);
    }
  }

  if (lastRequestTime.has(key)) {
    const diff = now - lastRequestTime.get(key);
    if (diff < INTERVAL_MS) {
      const violations = (violationCounts.get(key) || 0) + 1;
      violationCounts.set(key, violations);

      if (violations >= MAX_VIOLATIONS) {
        bannedClients.set(key, now + BAN_TIME_MS);
        violationCounts.delete(key);
        return res.status(429).json({
          error: 'Слишком много запросов. Подождите немного и попробуйте снова',
          code: 429,
        });
      }

      return res.status(429).json({
        code: 429,
      });
    }
  }

  lastRequestTime.set(key, now);
  next();
}
