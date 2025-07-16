/**
 * @module telegramBot/events/newChatMembers
 * @description Событие новых участников чата в Telegram боте.
 */
import send from '#telegramBot/send.js';

export default async function registerNewChatMembersEvent(bot) {
  bot.on('new_chat_members', async (ctx) => {
    for (const user of ctx.message.new_chat_members) {
      const name = user.username ? `@${user.username}` : user.first_name;
      await send(ctx, `Привет, ${name}! Добро пожаловать в группу `);
    }
  });
}
