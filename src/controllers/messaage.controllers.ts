import { Request, Response, RequestHandler, NextFunction } from 'express';
import catchAsync from '@/utils/catchAsync';
import httpStatus from 'http-status';
import { prisma } from '@/utils/prismaClient';
import { UploadedFile } from 'express-fileupload';
import { uploadSingleImage } from '@/utils/cloudinaryImageUpload';
import { getReceiverSocketId, io } from '@/utils/socket';
import AppError from '@/utils/AppError';

export const getMessages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const messages = await prisma.message.findMany({
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
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Messaged retrived successfully',
      data: messages,
    });
  },
);

export const sendMessages: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { text } = req.body;
    if (text === '') {
      return next(
        new AppError(httpStatus.BAD_REQUEST, 'Message cannot be empty'),
      );
    }
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let image;
    if (req.files?.image) {
      image = await uploadSingleImage(
        req.files?.image as UploadedFile,
        'messaages',
      );
    }
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
        image: image ? image : null,
      },
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', message);
    }
    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  },
);
