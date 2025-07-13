/**
 * @module telegramBot/store/tempBoardCreate
 * @description Временное хранилище для создания досок в Telegram боте.
 */
const boardCreationStore = new Map();

export function setBoardCreationState(userUuid, state) {
  if (!boardCreationStore.has(userUuid)) {
    boardCreationStore.set(userUuid, {});
  }
  boardCreationStore.get(userUuid).state = state;
}

export function setBoardTitle(userUuid, title) {
  if (!boardCreationStore.has(userUuid)) {
    boardCreationStore.set(userUuid, {});
  }
  boardCreationStore.get(userUuid).title = title;
}

export function getBoardCreationData(userUuid) {
  return boardCreationStore.get(userUuid);
}

export function clearBoardCreation(userUuid) {
  boardCreationStore.delete(userUuid);
}
