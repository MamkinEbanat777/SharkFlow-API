export const validateMiddleware = (schema) => async (req, res, next) => {
  try {
    const validated = await schema.validate(req.body, {
      abortEarly: false,
    });

    req.validatedBody = validated;
    next();
  } catch (error) {
    const validationErrors = error.details.map(detail => detail.message);
    res.status(400).json({ 
      error: 'Validation failed',
      details: validationErrors 
    });
  }
};
