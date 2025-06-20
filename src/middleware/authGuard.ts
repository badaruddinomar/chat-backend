import { Request, Response, NextFunction } from 'express';
import AppError from '@/utils/AppError';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '@/config';
import httpStatus from 'http-status';
import { IUser } from '@/interface/user.interface';
import { prisma } from '@/utils/prismaClient';
import catchAsync from '@/utils/catchAsync';
import { Socket } from 'socket.io';
import { parse } from 'cookie';

export const isAuthenticatedUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
      res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Please login to access this resource',
      });
      return;
    }

    const decodedData = jwt.verify(token, config.jwt_secret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decodedData?.userId },
    });

    if (!user) {
      return next(
        new AppError(
          httpStatus.UNAUTHORIZED,
          'User no longer exists. Please login again.',
        ),
      );
    }

    if (!user.isVerified) {
      return next(
        new AppError(httpStatus.UNAUTHORIZED, 'Please verify your email.'),
      );
    }

    req.user = user as IUser;
    next();
  },
);
// Authorize Roles--
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role as string)) {
      return next(
        new AppError(
          httpStatus.FORBIDDEN,
          `Role ${req.user.role} is not allowed to access this resource.`,
        ),
      );
    }
    next();
  };
};
export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const rawCookie = socket.handshake.headers.cookie || '';
    const cookies = parse(rawCookie);
    const token = cookies.token;

    if (!token) {
      throw next(
        new AppError(
          httpStatus.UNAUTHORIZED,
          'Please login to access this resource.',
        ),
      );
    }

    const decodedData = jwt.verify(token, config.jwt_secret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decodedData?.userId },
    });

    if (!user) {
      throw next(
        new AppError(
          httpStatus.UNAUTHORIZED,
          'Please login to access this resource.',
        ),
      );
    }
    socket.user = user as IUser;
    next();
  } catch (err) {
    return next(err as Error);
  }
};
