export default async function send(ctx, message, extra = {}) {
  const replyFn = ctx.update?.callback_query
    ? ctx.editMessageText?.bind(ctx)
    : ctx.reply?.bind(ctx);

  if (replyFn) {
    await replyFn(message, { parse_mode: 'HTML', ...extra });
  } else {
    console.warn('Нет подходящего метода для отправки сообщения');
  }
}
