export const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .substring(0, 64);
};

export const isValidColor = (color) => {
  if (typeof color !== 'string') return false;
  const cleaned = color.trim().replace(/^#/, '');
  return /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleaned);
};

export const sanitizeColor = (color) => {
  if (typeof color !== 'string') return '';
  return color.trim().replace(/^#/, '');
};

export const validateBoardTitle = (title) => {
  if (title === undefined) return { isValid: true, value: undefined };

  if (typeof title !== 'string') {
    return { isValid: false, error: 'Название должно быть строкой' };
  }

  const sanitized = sanitizeInput(title);
  if (sanitized.length < 1) {
    return { isValid: false, error: 'Название доски не может быть пустым' };
  }

  if (sanitized.length > 64) {
    return {
      isValid: false,
      error: 'Название слишком длинное (максимум 64 символа)',
    };
  }

  return { isValid: true, value: sanitized };
};

export const validatePaginationParams = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(50, Math.max(1, parseInt(limit) || 10));
  return { page: validPage, limit: validLimit };
};

export const validateBooleanField = (value, fieldName) => {
  if (value === undefined) return { isValid: true, value: undefined };

  if (typeof value !== 'boolean') {
    return { isValid: false, error: `Поле ${fieldName} должно быть boolean` };
  }

  return { isValid: true, value };
};
