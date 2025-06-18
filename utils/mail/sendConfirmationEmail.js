import { renderEmail } from './emailRenderer.js';
import { sendEmail } from './mailer.js';

export async function sendConfirmationEmail({ to, type, confirmationCode }) {
  const subjectMap = {
    registration: 'Добро пожаловать в TaskFlow!',
    passwordReset: 'Сброс пароля в TaskFlow',
    deleteUser: 'Удаление аккаунта TaskFlow',
    updateUser: 'Обновление данных аккаунта TaskFlow',
    emailChange: 'Подтверждение нового email',
  };

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
