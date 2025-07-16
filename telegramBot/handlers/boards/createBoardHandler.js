/**
 * @module telegramBot/handlers/boards/createBoard
 * @description Обработчик создания досок в Telegram боте.
 */
import send from '#telegramBot/send.js';
import { setBoardCreationState, clearBoardCreation } from '#telegramBot/store/tempBoardCreateStore.js';

export async function createBoardsHandler(ctx) {
  const user = ctx.state.user;
  const userUuid = user?.uuid;

  if (!userUuid) {
    return send(ctx, '❌ Пользователь не найден.');
  }

  clearBoardCreation(userUuid);
  setBoardCreationState(userUuid, 'awaiting_title');

  return send(ctx, 'Введите название новой доски:');
}
