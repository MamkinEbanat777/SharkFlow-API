import { authenticateTelegramMiddleware } from '../middlewares/http/authenticateTelegramMiddleware.js';

export default function withAuth(handler) {
  return async (ctx) => {
    await authenticateTelegramMiddleware(ctx, async () => {
      await handler(ctx);
    });
  };
}
