import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendEmail({ to, subject, text = '', html }) {
  try {
    const info = await transporter.sendMail({
      from: `"TaskFlow" ${process.env.MAIL_USER}`,
      to,
      subject,
      text,
      html,
    });

    console.log('Письмо отправлено:', info.messageId);
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
  }
}
