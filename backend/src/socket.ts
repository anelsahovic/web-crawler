import { Server } from 'socket.io';

let io: Server;

export const setupSocketIO = (ioInstance: Server) => {
  io = ioInstance;

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
};

export const emitCrawlStatus = (data: {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'DONE' | 'ERROR';
}) => {
  if (!io) return;
  io.emit('urlStatusUpdate', data); // All clients will receive
};
