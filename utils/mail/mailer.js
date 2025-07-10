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
      from: `"SharkFlow" ${process.env.MAIL_USER}`,
      to,
      subject,
      text,
      html,
    });

    console.info('Письмо отправлено:', info.messageId);
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
    throw error;
  }
}

// import { Resend } from 'resend';
// const resend = new Resend(process.env.MAIL_RESEND_API_KEY);

// export async function sendEmail({ to, subject, text = '', html }) {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: 'SharkFlow <onboarding@resend.dev>',
//       to,
//       subject,
//       text,
//       html,
//     });

//     if (error) {
//       console.error('Resend error:', error);
//       throw new Error(error.message);
//     }

//     console.info('Email sent via Resend:', data?.id);
//   } catch (err) {
//     console.error('Resend fatal error:', err);
//     throw err;
//   }
// }
