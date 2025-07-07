import send from '../../send.js';
import {
  setBoardCreationState,
  clearBoardCreation,
} from '../../store/tempBoardCreateStore.js';

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
