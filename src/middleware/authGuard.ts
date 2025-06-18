import { Request, Response, NextFunction } from 'express';
import AppError from '@/utils/AppError';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '@/config';
import httpStatus from 'http-status';
import { IUser } from '@/interface/user.interface';
import { prisma } from '@/utils/prismaClient';
import catchAsync from '@/utils/catchAsync';

export const isAuthenticatedUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError(
          httpStatus.UNAUTHORIZED,
          'Please login to access this resource.',
        ),
      );
    }

    const token = authHeader.split(' ')[1];

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
