const confirmedUsers = new Map();

const EXPIRE_MS = 5 * 60 * 1000;

export function setEmailConfirmed(userUuid) {
  const expiresAt = Date.now() + EXPIRE_MS;
  confirmedUsers.set(userUuid, expiresAt);
}

export function isEmailConfirmed(userUuid) {
  const expiresAt = confirmedUsers.get(userUuid);
  if (!expiresAt) return false;

  if (Date.now() > expiresAt) {
    confirmedUsers.delete(userUuid);
    return false;
  }

  return true;
}

export function clearEmailConfirmed(userUuid) {
  confirmedUsers.delete(userUuid);
}
