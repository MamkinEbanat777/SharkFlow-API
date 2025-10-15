export const validateMiddleware = (schema) => async (req, res, next) => {
       console.info("Payload до валидации:", req.body);

  try {
    const validated = await schema.validate(req.body, {
      abortEarly: false,
    });

    req.validatedBody = validated;
    console.info("Пришедщие данные:",req.validatedBody)
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
    
    console.error("Ошибка валидации:", details);
    res.status(400).json({
      error: 'Ошибка валидации данных',
      details,
    });
  }
};
