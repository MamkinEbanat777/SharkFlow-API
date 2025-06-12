export function socketHandlers(io, socket) {
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
  socket.on('todo:createBoard', () => {
    console.log('Боард создан');
  });
}
