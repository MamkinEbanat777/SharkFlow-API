import { logSocketDisconnect, logSocketBoardCreated } from '../utils/loggers/socketLoggers.js';

export const handleSocketEvents = (socket) => {
  socket.on('disconnect', () => {
    logSocketDisconnect(socket.id, socket.userUuid);
  });

  socket.on('createBoard', async (data) => {
    logSocketBoardCreated();
  });
};
