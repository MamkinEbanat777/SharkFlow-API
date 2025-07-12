import { logInfo } from './baseLogger.js';

export const logSocketDisconnect = (socketId, userUuid) => {
  logInfo('Socket', 'disconnected', `Socket disconnected: ${socketId}, User UUID: ${userUuid}`);
};

export const logSocketBoardCreated = () => {
  logInfo('Socket', 'boardCreated', 'Боард создан');
};

export const logSocketPartialDisconnect = (userUuid) => {
  logInfo('Socket', 'partialDisconnect', `Пользователь ${userUuid} отключил одно из устройств`);
}; 