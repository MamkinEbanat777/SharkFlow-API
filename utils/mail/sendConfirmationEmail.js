import { renderEmail } from './emailRenderer.js';
import { sendEmail } from './mailer.js';

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
    connectGoogle: 'Подключение авторизации через Google',
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
