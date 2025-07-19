import dotenv from 'dotenv';
import app from './app';
import http from 'http';
import { Server } from 'socket.io';
import { setupSocketIO } from './socket';

dotenv.config();

const PORT = process.env.PORT || 5001;

// Create raw HTTP server
const server = http.createServer(app);

// Create Socket.IO server attached to the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store io globally
setupSocketIO(io);

server.listen(PORT, () => {
  console.log('✅ Server is running on PORT:', PORT);
});
