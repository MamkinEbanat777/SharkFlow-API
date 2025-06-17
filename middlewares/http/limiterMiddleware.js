const requestBuckets = new Map();
const violationCounts = new Map();
const bannedClients = new Map();

let MAX_REQUESTS_PER_INTERVAL;
if (process.env.NODE_ENV === 'production') {
  MAX_REQUESTS_PER_INTERVAL = 1;
} else {
  MAX_REQUESTS_PER_INTERVAL = 5;
}

const INTERVAL_MS = 1000;
const BAN_TIME_MS = 60 * 1000;
const MAX_VIOLATIONS = 20;

function getClientKey(req) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown_ip';
  const ua = req.headers['user-agent'] || 'unknown_ua';
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
      });
    } else {
      bannedClients.delete(key);
      violationCounts.delete(key);
      requestBuckets.delete(key);
    }
  }

  const timestamps = requestBuckets.get(key) || [];

  const freshTimestamps = timestamps.filter((ts) => now - ts < INTERVAL_MS);

  freshTimestamps.push(now);
  requestBuckets.set(key, freshTimestamps);

  if (freshTimestamps.length > MAX_REQUESTS_PER_INTERVAL) {
    const violations = (violationCounts.get(key) || 0) + 1;
    violationCounts.set(key, violations);

    if (violations >= MAX_VIOLATIONS) {
      bannedClients.set(key, now + BAN_TIME_MS);
      return res.status(429).json({
        error: 'Вы были временно заблокированы за чрезмерную активность',
      });
    }

    return res.status(429).json({
      error: 'Слишком много запросов. Повторите попытку позже',
    });
  } else {
    violationCounts.set(key, 0);
  }

  next();
}
