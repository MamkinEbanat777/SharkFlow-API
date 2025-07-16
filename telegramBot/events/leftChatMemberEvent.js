/**
 * @module telegramBot/events/leftChatMember
 * @description Событие выхода участника из чата в Telegram боте.
 */
import send from '#telegramBot/send.js';

export default async function registerLeftChatMemberEvent(bot) {
  bot.on('left_chat_member', async (ctx) => {
    const user = ctx.message.left_chat_member;
    const name = user.username ? `@${user.username}` : user.first_name;
    await send(ctx, `${name} покинул(а) группу 😢`);
  });
}
