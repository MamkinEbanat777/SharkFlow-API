import jwt from 'jsonwebtoken';


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
    
    console.error('Unexpected JWT error:', error);
    return {
      isValid: false,
      error: 'Произошла ошибка авторизации. Пожалуйста, войдите в систему заново'
    };
  }
};


export const isTokenExpired = (expiresAt) => {
  return Date.now() > expiresAt.getTime();
};


export const shouldRotateToken = (expiresAt) => {
  const timeLeft = expiresAt.getTime() - Date.now();
  return timeLeft < 600000; 
}; 
