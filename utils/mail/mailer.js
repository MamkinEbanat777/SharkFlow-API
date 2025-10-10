/**
 * @module mail/mailer
 * @description Основной модуль для отправки email.
 */
import nodemailer from 'nodemailer';
import {
  logMailSendSuccess,
  logMailSendError,
} from '#utils/loggers/mailLoggers.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // pool: true,
  connectionTimeout: 30_000,
  greetingTimeout: 20_000,
  socketTimeout: 45_000,
});

/**
 * Отправляет email через SMTP
 * @param {Object} params - Параметры email
 * @param {string} params.to - Email получателя
 * @param {string} params.subject - Тема письма
 * @param {string} [params.text=''] - Текстовое содержимое
 * @param {string} params.html - HTML содержимое
 * @returns {Promise<Object>} Информация об отправке
 * @throws {Error} При ошибке отправки
 */
export async function sendEmail({ to, subject, text = '', html }) {
  console.log('🚀 Trying to send email to:', to);
  console.log('📧 MAIL_USER:', process.env.MAIL_USER);
  console.log('🔑 MAIL_PASS length:', process.env.MAIL_PASS?.length);
  try {
    const mailOptions = {
      from: 'SharkFlow',
      to,
      subject,
      text,
      html,
    };

    console.log('📨 Sending mail...');

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
