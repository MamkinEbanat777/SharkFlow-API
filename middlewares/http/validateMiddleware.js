export const validateMiddleware = (schema) => async (req, res, next) => {
  try {
    const validated = await schema.validate(req.body, {
      abortEarly: false,
    });

    req.validatedBody = validated;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Неверный пароль' });
  }
};
