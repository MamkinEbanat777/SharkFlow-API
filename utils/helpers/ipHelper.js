
export const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',').shift() || 
         req.socket.remoteAddress || 
         'unknown';
}; 