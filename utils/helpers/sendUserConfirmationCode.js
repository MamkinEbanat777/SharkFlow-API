/**
 * @module helpers/sendUserConfirmationCode
 * @description Вспомогательные функции для отправки кодов подтверждения пользователям.
 */
import { generateConfirmationCode } from '../generators/generateConfirmationCode.js';
import { sendConfirmationEmail } from '../mail/sendConfirmationEmail.js';
import { setConfirmationCode } from '../../store/userVerifyStore.js';
import prisma from '../prismaConfig/prismaClient.js';
import { isValidUUID } from '../validators/taskValidators.js';

/**
 * Отправка кода подтверждения пользователю
 * @param {Object} params - Параметры функции
 * @param {string} params.userUuid - UUID пользователя
 * @param {string} params.type - Тип подтверждения (email, totp, etc.)
 * @param {Object} params.loggers - Объект с логгерами
 * @param {string} [params.email] - Email для отправки (если skipUserCheck = true)
 * @param {boolean} [params.skipUserCheck=false] - Пропустить проверку пользователя
 * @returns {Promise<string>} Сгенерированный код подтверждения
 * @throws {Error} Если пользователь не найден или email отсутствует
 * @example
 * const code = await sendUserConfirmationCode({
 *   userUuid: 'user-uuid',
 *   type: 'email',
 *   loggers: authLoggers
 * });
 */
export async function sendUserConfirmationCode({
  userUuid,
  type,
  loggers,
  email,
  skipUserCheck = false,
}) {
  if (!isValidUUID(userUuid)) {
    throw new Error('Invalid user UUID');
  }

  let actualEmail = email;

  if (!skipUserCheck) {
    const user = await prisma.user.findFirst({
      where: { uuid: userUuid, isDeleted: false },
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
  await setConfirmationCode(type, userUuid, confirmationCode);
  await sendConfirmationEmail({
    to: actualEmail,
    type,
    confirmationCode,
  });

  loggers?.success?.(userUuid, actualEmail);
  return confirmationCode;
}
