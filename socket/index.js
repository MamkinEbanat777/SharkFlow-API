import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/ws/socketAuthMiddleware.js';
import { socketRateLimitMiddleware } from '../middlewares/ws/socketRateLimitMiddleware.js';
import { allowedOrigins } from '../config/allowedOrigins.js';
import { allowedMethods } from '../config/allowedMethods.js';
import { socketHandlers } from './handlers.js';

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by Socket.IO CORS'));
        }
      },
      methods: allowedMethods,
    },
  });

  io.use(socketAuthMiddleware);
  io.use(socketRateLimitMiddleware);

  io.on('connection', (socket) => {
    const userUuid = socket.userUuid;

    socket.join(userUuid);

    // console.log(`Socket connected: ${socket.id}, User UUID: ${userUuid}`);

    io.to(userUuid).emit('notification', {
      message: `Пользователь ${userUuid} подключился с устройства ${socket.id}`,
      timestamp: new Date(),
    });

    socketHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}, User UUID: ${userUuid}`);

      const userSockets = io.sockets.adapter.rooms.get(userUuid);
      if (!userSockets || userSockets.size === 0) {
        io.to(userUuid).emit('notification', {
          message: `Пользователь ${userUuid} полностью отключился`,
          timestamp: new Date(),
        });
      } else {
        console.log('Пользоветль отключил одно из устройств');
        io.to(userUuid).emit('notification', {
          message: `Пользователь ${userUuid} отключил одно из устройств`,
          timestamp: new Date(),
        });
      }
    });
  });

  return io;
}
