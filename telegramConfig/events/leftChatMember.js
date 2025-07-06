export default async function registerLeftChatMemberEvent(bot) {
  bot.on('left_chat_member', async (ctx) => {
    const user = ctx.message.left_chat_member;
    const name = user.username ? `@${user.username}` : user.first_name;
    await ctx.reply(`${name} покинул(а) группу 😢.`);
  });
}
