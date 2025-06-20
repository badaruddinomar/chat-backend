import { Request, Response, RequestHandler } from 'express';
import catchAsync from '@/utils/catchAsync';
import httpStatus from 'http-status';
import { prisma } from '@/utils/prismaClient';

export const getAllUsers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const loggedInUserId = req.user.id;

    // Prisma query to find all users except the logged-in user
    const filteredUsers = await prisma.user.findMany({
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

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Users retrived successfully',
      data: filteredUsers,
    });
  },
);

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
