import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import express, { Application } from 'express';
import config from '@/config';
import { IUser } from '@/interface/user.interface';
const app: Application = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.client_url,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// used to store online users
const userSocketMap: Record<string, string> = {}; // {userId: socketId}
export function getReceiverSocketId(userId: string) {
  return userSocketMap[userId];
}

io.on('connection', (socket) => {
  console.log('A user connected');
  const userId = (socket.user as IUser).id;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    delete userSocketMap[userId as string];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { io, app, server };
