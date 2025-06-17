function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function normalizeUserData({ email, login }) {
  const result = {};

  if (typeof email === 'string' && email.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return null;
    }
    result.email = normalizedEmail;
  }

  if (typeof login === 'string' && login.trim()) {
    let normalizedLogin = login.trim().toLowerCase();

    if (normalizedLogin.length > 30) {
      return null;
    }

    result.login = normalizedLogin;
  }

  return result;
}
