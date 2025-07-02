export function sanitizeLogin(base) {
  return base
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 20);
}
