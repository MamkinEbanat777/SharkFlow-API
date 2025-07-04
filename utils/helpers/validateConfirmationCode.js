import {
  getConfirmationCode,
  isConfirmationBlocked,
  registerFailedAttempt,
  resetConfirmationAttempts,
} from '../../store/userVerifyStore.js';

export async function validateConfirmationCode(userUuid, type, code, loggers) {
  console.log('code:', JSON.stringify(code));

  if (!code?.toString().trim()) {
    loggers?.failure?.(userUuid, 'Confirmation code not provided');
    return false;
  }
  console.log('foo');
  const blocked = await isConfirmationBlocked(type, userUuid);
  if (blocked) {
    loggers?.failure?.(
      userUuid,
      'Too many failed attempts, temporarily blocked',
    );
    return false;
  }

  const stored = await getConfirmationCode(type, userUuid);

  console.log('stored:', JSON.stringify(stored));
  console.log('code:', JSON.stringify(code));
  console.log('equal:', String(stored) === String(code));

  if (!stored || String(stored) !== String(code)) {
    await registerFailedAttempt(type, userUuid);
    loggers?.failure?.(userUuid, 'Invalid or expired confirmation code');
    return false;
  }

  await resetConfirmationAttempts(type, userUuid);
  loggers?.success?.(userUuid);
  return true;
}
