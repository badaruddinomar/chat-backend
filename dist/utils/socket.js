'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.server = exports.app = exports.io = void 0;
exports.getReceiverSocketId = getReceiverSocketId;
const socket_io_1 = require('socket.io');
const http_1 = __importDefault(require('http'));
const express_1 = __importDefault(require('express'));
const config_1 = __importDefault(require('@/config'));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
  cors: {
    origin: config_1.default.client_url,
    credentials: true,
  },
});
exports.io = io;
// used to store online users
const userSocketMap = {}; // {userId: socketId}
function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
io.on('connection', (socket) => {
  console.log('A user connected');
  const userId = socket.user.id;
  if (userId) userSocketMap[userId] = socket.id;
  // io.emit() is used to send events to all the connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});
