/**
 * @module mail/sendConfirmationEmail
 * @description Функции для отправки email с кодами подтверждения.
 */
import { renderEmail } from './emailRenderer.js';
import { sendEmail } from './mailer.js';

/**
 * Отправляет email с кодом подтверждения
 * @param {Object} params - Параметры
 * @param {string} params.to - Email получателя
 * @param {string} params.type - Тип подтверждения
 * @param {string} params.confirmationCode - Код подтверждения
 * @returns {Promise<Object>} Результат отправки email
 * @throws {Error} Если неизвестный тип подтверждения
 */
export async function sendConfirmationEmail({ to, type, confirmationCode }) {
  const subjectMap = {
    registration: 'Добро пожаловать в SharkFlow!',
    passwordReset: 'Сброс пароля в SharkFlow',
    deleteUser: 'Удаление аккаунта SharkFlow',
    updateUser: 'Обновление данных аккаунта SharkFlow',
    setupTotp: 'Подключение двуфакторной аутентификации',
    disableTotp: 'Отключение двуфакторной аутентификации',
    emailChange: 'Подтверждение нового email',
    disableGoogle: 'Отключение авторизации через Google',
    connectGoogle: 'Подключение Google',
    connectGithub: 'Подключение Github',
    disableGithub: 'Отключение Github',
    connectYandex: 'Подключение Yandex',
    disableYandex: 'Отключение Yandex',
    restoreUser: 'Восстановление аккаунта',
  };

  if (!subjectMap[type]) {
    throw new Error(`Unknown confirmation email type: ${type}`);
  }

  const html = await renderEmail(type, {
    title: subjectMap[type],
    confirmationCode,
  });

  return sendEmail({
    from: process.env.MAIL_USER,
    to,
    subject: subjectMap[type],
    html,
  });
}
