export function handleRouteError(res, error, {
  mappings = {},
  status = 500,
  message = 'Произошла внутренняя ошибка сервера',
  logPrefix = 'Ошибка в маршруте',
  requestId = null,
} = {}) {
  if (error && error.code && mappings[error.code]) {
    const { status: mappedStatus, message: mappedMessage } = mappings[error.code];
    if (requestId) {
      console.error(`${logPrefix} [${requestId}]:`, error);
    } else {
      console.error(`${logPrefix}:`, error);
    }
    const response = { error: mappedMessage };
    if (requestId) response.requestId = requestId;
    return res.status(mappedStatus).json(response);
  }

  if (requestId) {
    console.error(`${logPrefix} [${requestId}]:`, error);
  } else {
    console.error(`${logPrefix}:`, error);
  }
  const response = { error: message };
  if (requestId) response.requestId = requestId;
  res.status(status).json(response);
} 