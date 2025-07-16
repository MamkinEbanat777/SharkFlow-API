/**
 * @module helpers/verifyTurnstileCaptcha
 * @description Вспомогательные функции для проверки Turnstile Captcha
 */
import axios from 'axios';
import { logExternalServiceError } from '#utils/loggers/systemLoggers.js';

const EXPECTED_DOMAIN = process.env.FRONTEND_DOMAIN;

export async function verifyTurnstileCaptcha(token, ipAddress, idempotencyKey) {
  try {
    const response = await axios.post(
      process.env.TURNSTILE_URL,
      {
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ipAddress,
        idempotency_key: idempotencyKey,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      },
    );

    const data = response.data;

    if (!data.success) {
      logExternalServiceError(
        'Turnstile',
        'captchaFailed',
        new Error(`Turnstile captcha failed: ${data['error-codes']}`),
      );
      return false;
    }

    // if (data.score < 0.5) {
    //   logExternalServiceError('Turnstile', 'lowScore', new Error(`Turnstile score too low: ${data.score} (threshold: 0.5)`));
    //   return false;
    // }

    // if (data.action !== 'submit') {
    //   logExternalServiceError('Turnstile', 'invalidAction', new Error(`Turnstile action mismatch: ${data.action} (expected: submit)`));
    //   return false;
    // }

    if (data.domain && data.domain !== EXPECTED_DOMAIN) {
      console.warn(
        `Turnstile captcha domain mismatch: expected "${EXPECTED_DOMAIN}", got "${data.domain}"`,
      );
      return false;
    }

    return true;
  } catch (error) {
    logExternalServiceError('Turnstile', 'verification', error);
    return false;
  }
}
