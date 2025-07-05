import { createAccessToken } from '../tokens/accessToken.js';
import { createCsrfToken } from '../tokens/csrfToken.js';
import { issueRefreshToken } from '../tokens/refreshToken.js';
import { getRefreshCookieOptions } from '../cookie/loginCookie.js';
import { getClientIP } from './ipHelper.js';

export const createAuthTokens = async (user, rememberMe, req) => {
  const accessToken = createAccessToken(user.uuid, user.role);
  const csrfToken = createCsrfToken(user.uuid, user.role);
  const refreshToken = await issueRefreshToken({
    res: req.res,
    userUuid: user.uuid,
    rememberMe,
    ipAddress: getClientIP(req),
    userAgent: req.get('user-agent') || null,
    referrer: req.get('Referer') || null,
    userId: user.id, 
  });

  return { accessToken, csrfToken, refreshToken };
};


export const setAuthCookies = (res, refreshToken, rememberMe) => {
  res.cookie(
    'log___tf_12f_t2',
    refreshToken,
    getRefreshCookieOptions(rememberMe),
  );
};

export const getRequestInfo = (req) => {
  return {
    ipAddress: getClientIP(req),
    userAgent: req.get('user-agent') || null,
  };
}; 