export default async function send(ctx, message) {
  const replyFn = ctx.update?.callback_query
    ? ctx.editMessageText?.bind(ctx)
    : ctx.reply?.bind(ctx);

  if (replyFn) {
    await replyFn(message, { parse_mode: 'HTML' });
  } else {
    console.warn('Нет подходящего метода для отправки сообщения');
  }
}
