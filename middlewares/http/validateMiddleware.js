export const validateMiddleware = (schema) => async (req, res, next) => {
  try {
    const validated = await schema.validate(req.body, {
      abortEarly: false,
    });

    req.validatedBody = validated;
    next();
  } catch (error) {
    let details;

    if (error.errors) {
      details = error.errors;
    } else if (error.details) {
      details = error.details.map((d) => d.message || d);
    } else {
      details = [error.message || 'Unknown validation error'];
    }

    res.status(400).json({
      error: 'Ошибка валидации данных',
      details,
    });
  }
};
