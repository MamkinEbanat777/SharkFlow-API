import { logTelegramCommandError } from '../utils/loggers/telegramLoggers.js';

export default async function send(ctx, message, extra = {}) {
  const replyFn = ctx.update?.callback_query
    ? ctx.editMessageText?.bind(ctx)
    : ctx.reply?.bind(ctx);

  if (replyFn) {
    await replyFn(message, { parse_mode: 'HTML', ...extra });
  } else {
    logTelegramCommandError('send', 'unknown', new Error('Нет подходящего метода для отправки сообщения'));
  }
}
