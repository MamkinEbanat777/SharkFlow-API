const lastRequestTime = new Map();
const violationCounts = new Map();
const bannedIPs = new Map();

const INTERVAL_MS = 500;
const BAN_TIME_MS = 15 * 60 * 1000;
const MAX_VIOLATIONS = 5;

export function limiterMiddleware(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (bannedIPs.has(ip)) {
    const banExpires = bannedIPs.get(ip);
    if (now < banExpires) {
      return res.status(429).json({
        error: 'Слишком много запросов. Попробуйте попытку позже',
        code: 429,
      });
    } else {
      bannedIPs.delete(ip);
      violationCounts.delete(ip);
      lastRequestTime.delete(ip);
    }
  }

  if (lastRequestTime.has(ip)) {
    const diff = now - lastRequestTime.get(ip);
    if (diff < INTERVAL_MS) {
      const violations = (violationCounts.get(ip) || 0) + 1;
      violationCounts.set(ip, violations);

      if (violations >= MAX_VIOLATIONS) {
        bannedIPs.set(ip, now + BAN_TIME_MS);
        violationCounts.delete(ip);
        return res.status(429).json({
          error: 'Слишком много запросов. Попробуйте попытку позже',
          code: 429,
        });
      }

      return res.status(429).json({
        // error: `Подожди секунду перед следующим запросом. Осталось попыток до бана: ${
        //   MAX_VIOLATIONS - violations
        // }`,
        code: 429,
      });
    }
  }

  lastRequestTime.set(ip, now);
  next();
}
