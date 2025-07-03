import { generateConfirmationCode } from '../generators/generateConfirmationCode.js';
import { sendConfirmationEmail } from '../mail/sendConfirmationEmail.js';
import { setConfirmationCode } from '../../store/userVerifyStore.js';
import prisma from '../prismaConfig/prismaClient.js';

export async function sendUserConfirmationCode({
  userUuid,
  type,
  loggers,
  email,
  skipUserCheck = false,
}) {
  let actualEmail = email;

  if (!skipUserCheck) {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { email: true },
    });

    if (!user) {
      loggers?.failure?.(userUuid, 'User not found');
      throw new Error('Пользователь не найден');
    }

    actualEmail = user.email;
  }

  if (!actualEmail) {
    loggers?.failure?.(userUuid, 'Email missing');
    throw new Error('Email пользователя отсутствует');
  }

  const confirmationCode = generateConfirmationCode();
  setConfirmationCode(userUuid, confirmationCode);
  await sendConfirmationEmail({
    to: actualEmail,
    type,
    confirmationCode,
  });

  loggers?.success?.(userUuid, actualEmail);
  return confirmationCode;
}
