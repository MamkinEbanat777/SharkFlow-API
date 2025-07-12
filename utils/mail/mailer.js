import nodemailer from 'nodemailer';
import { logMailSendSuccess, logMailSendError } from '../loggers/mailLoggers.js';

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
    const mailOptions = {
      from: `"SharkFlow" ${process.env.MAIL_USER}`,
      to,
      subject,
      text,
      html,
    };

    const info = await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logMailSendError(error);
          return reject(error);
        }
        logMailSendSuccess(info.messageId);
        resolve(info);
      });
    });

    return info;
  } catch (error) {
    logMailSendError(error);
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
//       logError('Resend error:', error);
//       throw new Error(error.message);
//     } else {
//       logInfo('Email sent via Resend:', data?.id);
//     }
//   } catch (err) {
//     logError('Resend fatal error:', err);
//     throw err;
//   }
// }
