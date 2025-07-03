import { generateConfirmationCode } from '../generators/generateConfirmationCode.js';
import { sendConfirmationEmail } from '../mail/sendConfirmationEmail.js';
import { setConfirmationCode } from '../../store/userVerifyStore.js';
import prisma from '../prismaConfig/prismaClient.js';

export async function sendUserConfirmationCode({ userUuid, type, loggers }) {
  const user = await prisma.user.findUnique({ where: { uuid: userUuid } });
  if (!user) {
    loggers?.failure?.(userUuid, 'User not found');
    throw new Error('Пользователь не найден');
  }
  const email = user.email;
  if (!email) {
    loggers?.failure?.(userUuid, 'Email missing');
    throw new Error('Email пользователя отсутствует');
  }
  const confirmationCode = generateConfirmationCode();
  setConfirmationCode(userUuid, confirmationCode);
  await sendConfirmationEmail({ to: email, type, confirmationCode });
  loggers?.success?.(userUuid, email);
  return confirmationCode;
} 