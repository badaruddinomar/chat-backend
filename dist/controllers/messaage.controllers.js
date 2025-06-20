'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.sendMessages =
  exports.getMessages =
  exports.getAllSidebarUsers =
    void 0;
const catchAsync_1 = __importDefault(require('@/utils/catchAsync'));
const http_status_1 = __importDefault(require('http-status'));
const prismaClient_1 = require('@/utils/prismaClient');
const cloudinaryImageUpload_1 = require('@/utils/cloudinaryImageUpload');
const socket_1 = require('@/utils/socket');
exports.getAllSidebarUsers = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const loggedInUserId = req.user.id;
    // Prisma query to find all users except the logged-in user
    const filteredUsers = yield prismaClient_1.prisma.user.findMany({
      where: {
        id: {
          not: loggedInUserId,
        },
      },
      select: {
        password: false,
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
    res.status(http_status_1.default.OK).json({
      success: true,
      message: 'Users retrived successfully',
      data: filteredUsers,
    });
  }),
);
exports.getMessages = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;
    const messages = yield prismaClient_1.prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: myId,
            receiverId: userToChatId,
          },
          {
            senderId: userToChatId,
            receiverId: myId,
          },
        ],
      },
    });
    res.status(http_status_1.default.OK).json({
      success: true,
      message: 'Messaged retrived successfully',
      data: messages,
    });
  }),
);
exports.sendMessages = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;
    let image;
    if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.image) {
      image = yield (0, cloudinaryImageUpload_1.uploadSingleImage)(
        (_b = req.files) === null || _b === void 0 ? void 0 : _b.image,
        'messaages',
      );
    }
    const message = yield prismaClient_1.prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
        image: image ? image : null,
      },
    });
    const receiverSocketId = (0, socket_1.getReceiverSocketId)(receiverId);
    if (receiverSocketId) {
      socket_1.io.to(receiverSocketId).emit('newMessage', message);
    }
    res.status(http_status_1.default.CREATED).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  }),
);
