import axios from 'axios';

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
      },
    );
    if (!response.data.success) {
      console.warn('Turnstile captcha failed:', response.data['error-codes']);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error during Turnstile captcha verification:', error);
    throw new Error('Ошибка сервера при проверке капчи');
  }
}
