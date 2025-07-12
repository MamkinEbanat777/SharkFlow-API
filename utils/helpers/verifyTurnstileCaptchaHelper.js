import axios from 'axios';

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
      console.warn('Turnstile captcha failed:', data['error-codes']);
      return false;
    }

    if (data.domain && data.domain !== EXPECTED_DOMAIN) {
      console.warn(
        `Turnstile captcha domain mismatch: expected "${EXPECTED_DOMAIN}", got "${data.domain}"`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error during Turnstile captcha verification:', error);
    throw new Error('Ошибка сервера при проверке капчи');
  }
}
