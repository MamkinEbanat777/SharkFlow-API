function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function normalizeEmail(email) {
  if (typeof email === 'string' && email.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return null;
    }
    return normalizedEmail;
  }
  return null;
}
