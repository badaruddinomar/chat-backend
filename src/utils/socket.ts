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
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');
  const userId = (socket.user as IUser).id;

  socket.join(userId?.toString() as string);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

export { io, app, server };
