import { logInfo } from './baseLogger.js';

/**
 * Логирование отключения WebSocket соединения
 * @param {string} socketId - ID сокета
 * @param {string} userUuid - UUID пользователя
 * @example
 * logSocketDisconnect('socket_123', '123e4567-e89b-12d3-a456-426614174000');
 */
export const logSocketDisconnect = (socketId, userUuid) => {
  logInfo('Socket', 'disconnected', `Socket disconnected: ${socketId}, User UUID: ${userUuid}`);
};

/**
 * Логирование создания доски через WebSocket
 * @example
 * logSocketBoardCreated();
 */
export const logSocketBoardCreated = () => {
  logInfo('Socket', 'boardCreated', 'Боард создан');
};

/**
 * Логирование частичного отключения пользователя (одно из устройств)
 * @param {string} userUuid - UUID пользователя
 * @example
 * logSocketPartialDisconnect('123e4567-e89b-12d3-a456-426614174000');
 */
export const logSocketPartialDisconnect = (userUuid) => {
  logInfo('Socket', 'partialDisconnect', `Пользователь ${userUuid} отключил одно из устройств`);
}; 