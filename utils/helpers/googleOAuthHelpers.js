import { OAuth2Client } from 'google-auth-library';

/**
 * Создание Google OAuth2 клиента
 * @returns {OAuth2Client} Google OAuth2 клиент
 * @example
 * const oauthClient = createGoogleOAuthClient();
 */
export const createGoogleOAuthClient = () => {
  return new OAuth2Client(
    process.env.CLIENT_GOOGLE_ID,
    process.env.CLIENT_GOOGLE_SECRET,
    'postmessage',
  );
};

/**
 * Получение токенов Google по коду авторизации
 * @param {OAuth2Client} oauth2Client - Google OAuth2 клиент
 * @param {string} code - Код авторизации от Google
 * @returns {Promise<Object>} Объект с токенами
 * @example
 * const tokens = await getGoogleTokens(oauthClient, 'auth_code_here');
 */
export const getGoogleTokens = async (oauth2Client, code) => {
  return await oauth2Client.getToken({
    code,
    redirect_uri: 'postmessage',
  });
};

/**
 * Верификация Google ID токена
 * @param {OAuth2Client} oauth2Client - Google OAuth2 клиент
 * @param {string} idToken - Google ID токен
 * @returns {Promise<Object>} Результат верификации токена
 * @example
 * const ticket = await verifyGoogleIdToken(oauthClient, 'id_token_here');
 */
export const verifyGoogleIdToken = async (oauth2Client, idToken) => {
  return await oauth2Client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_GOOGLE_ID,
  });
};

/**
 * Извлечение данных пользователя из Google токена
 * @param {Object} ticket - Результат верификации Google токена
 * @returns {Object} Объект с данными пользователя Google
 * @example
 * const userData = extractGoogleUserData(ticket);
 */
export const extractGoogleUserData = (ticket) => {
  const payload = ticket.getPayload();
  return {
    googleSub: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
    givenName: payload.given_name,
    picture: payload.picture,
  };
};

/**
 * Валидация данных пользователя Google
 * @param {Object} userData - Данные пользователя Google
 * @returns {Object} Результат валидации {isValid: boolean, error?: string}
 * @example
 * const validation = validateGoogleUserData(userData);
 * if (!validation.isValid) {
 *   throw new Error(validation.error);
 * }
 */
export const validateGoogleUserData = (userData) => {
  if (!userData.googleSub) {
    return { isValid: false, error: 'Некорректный токен Google' };
  }
  
  if (!userData.email || !userData.emailVerified) {
    return { 
      isValid: false, 
      error: 'Некорректный или неподтверждённый email Google' 
    };
  }
  
  return { isValid: true };
}; 