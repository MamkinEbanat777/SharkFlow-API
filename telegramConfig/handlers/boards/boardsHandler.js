import { getBoardsWithTaskCounts } from '../../../utils/helpers/boardHelpers.js';
import { getColorEmoji } from '../../utils/color/getColorEmoji.js';
import send from '../../send.js';

export async function boardsHandler(ctx) {
  const user = ctx.state.user;
  const userUuid = user.userUuid;

  try {
    const { boards, totalBoards } = await getBoardsWithTaskCounts(userUuid);

    if (boards.length === 0) {
      return send(ctx, 'У вас пока нет досок.');
    }

    const boardListText = boards
      .map((board, index) => {
        const pinMark = board.isPinned ? '📌 ' : '';
        const favMark = board.isFavorite ? '⭐ ' : '';
        const colorEmoji = getColorEmoji(board.color || '');

        return (
          `${index + 1}. ${pinMark}${favMark}<b>${board.title}</b>\n` +
          `   Задач: ${board.taskCount}\n` +
          `   Цвет: ${colorEmoji} (${board.color || '—'})\n` +
          `   Обновлено: ${new Date(board.updatedAt).toLocaleDateString()}`
        );
      })
      .join('\n\n');

    await send(
      ctx,
      `🗂 <b>Ваши доски (${totalBoards}):</b>\n\n${boardListText}`,
    );
  } catch (error) {
    console.error('[boardsHandler] Ошибка при получении досок:', error);
    await send(ctx, '❌ Произошла ошибка при получении досок.');
  }
}
