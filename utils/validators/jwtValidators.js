/**
 * @module validators/jwt
 * @description Валидаторы для JWT-токенов и проверки их срока действия.
 */
import jwt from 'jsonwebtoken';
import { logExternalServiceError } from '../loggers/systemLoggers.js';


/**
 * Валидация refresh-токена
 * @param {string} refreshToken - JWT refresh-токен
 * @returns {Object} Результат валидации
 * @returns {boolean} returns.isValid - Валидность токена
 * @returns {string} [returns.error] - Сообщение об ошибке
 * @returns {Object} [returns.payload] - Полезная нагрузка токена
 */
export const validateRefreshToken = (refreshToken) => {
  if (!refreshToken) {
    return {
      isValid: false,
      error: 'Ваша сессия истекла. Пожалуйста, войдите в систему заново'
    };
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256']
    });
    
    if (!payload.userUuid || typeof payload.userUuid !== 'string') {
      return {
        isValid: false,
        error: 'Ваша сессия повреждена. Пожалуйста, войдите в систему заново'
      };
    }

    return {
      isValid: true,
      payload
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        isValid: false,
        error: 'Ваша сессия истекла. Пожалуйста, войдите в систему заново'
      };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        isValid: false,
        error: 'Ваша сессия повреждена. Пожалуйста, войдите в систему заново'
      };
    }
    
    logExternalServiceError('JWT', 'validation', error);
    return { isValid: false, error: 'Invalid token' };
  }
};

/**
 * Проверяет, истёк ли токен по дате
 * @param {Date} expiresAt - Дата истечения
 * @returns {boolean} true, если токен истёк
 */
export const isTokenExpired = (expiresAt) => {
  return Date.now() > expiresAt.getTime();
};

/**
 * Нужно ли ротировать refresh-токен (меньше 10 минут до истечения)
 * @param {Date} expiresAt - Дата истечения
 * @returns {boolean} true, если нужно ротировать
 */
export const shouldRotateToken = (expiresAt) => {
  const timeLeft = expiresAt.getTime() - Date.now();
  return timeLeft < 600000; 
}; 
