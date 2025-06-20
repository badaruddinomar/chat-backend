import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '@/utils/AppError';
import { prisma } from '@/utils/prismaClient';
import { Prisma } from '@prisma/client';
import { UploadedFile } from 'express-fileupload';
import {
  deleteSingleImage,
  uploadSingleImage,
} from '@/utils/cloudinaryImageUpload';
import bcryptjs from 'bcryptjs';

export const getUserProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(
        new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated'),
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new AppError(httpStatus.NOT_FOUND, 'User not found'));
    }

    // Send response to client
    res.status(httpStatus.OK).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  },
);

export const getAllUsers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { search, page, limit } = req.query;

    const pageNumber =
      parseInt(page as string) > 0 ? parseInt(page as string) : 1;
    const limitNumber =
      parseInt(limit as string) > 0 ? parseInt(limit as string) : 10;
    const skip = (pageNumber - 1) * limitNumber;
    const searchText = search as string;

    const searchFilter: Prisma.UserWhereInput = {
      isVerified: true,
      ...(searchText && {
        OR: [
          { name: { contains: searchText.trim(), mode: 'insensitive' } },
          { email: { contains: searchText.trim(), mode: 'insensitive' } },
        ],
      }),
    };
    // Get all users
    const users = await prisma.user.findMany({
      where: searchFilter,
      skip,
      take: limitNumber,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const totalUsers = await prisma.user.count({
      where: {
        isVerified: true,
      },
    });
    // Send response to client
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      meta: {
        totalUsers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
      },
    });
  },
);

export const updateUserProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { name, phone, address } = req.body;
    const avatar = req.files?.avatar as UploadedFile;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new AppError(httpStatus.NOT_FOUND, 'User not found'));
    }

    let avatarObj: { url: string; public_id: string } | null = user.avatar;
    // check is avatar exists--
    if (avatar) {
      // check avatar is more than one--
      if (Array.isArray(avatar)) {
        return next(
          new AppError(
            httpStatus.BAD_REQUEST,
            'Only one image can be uploaded for avatar',
          ),
        );
      }
      // check avatar file type is valid---
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(avatar.mimetype)) {
        return next(
          new AppError(
            httpStatus.BAD_REQUEST,
            'Invalid image type, image must be jpeg, png or webp',
          ),
        );
      }
      // check avatar file size--
      const MAX_SIZE = 2 * 1024 * 1024;
      if (avatar.size > MAX_SIZE) {
        return next(
          new AppError(
            httpStatus.BAD_REQUEST,
            'Image size must be less than 2MB',
          ),
        );
      }
      // Delete old avatar
      if (user.avatar?.public_id) {
        await deleteSingleImage(user.avatar.public_id);
      }
      // upload new avatar--
      avatarObj = await uploadSingleImage(avatar, 'tohori_avatars');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        address,
        avatar: avatarObj,
      },
    });
    const { password: _password, ...userData } = updatedUser;
    // Send response to client
    res.status(httpStatus.OK).json({
      success: true,
      message: 'User profile updated successfully',
      data: userData,
    });
  },
);

export const deleteUser: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new AppError(httpStatus.NOT_FOUND, 'User not found'));
    }
    if (user.avatar?.public_id) {
      await deleteSingleImage(user.avatar.public_id);
    }
    await prisma.user.delete({ where: { id: userId } });
    // Send response to client
    res.status(httpStatus.OK).json({
      success: true,
      message: 'User deleted successfully',
    });
  },
);

export const changePassword: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new AppError(httpStatus.NOT_FOUND, 'User not found'));
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'Invalid credentials'));
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    // Send response to client
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Password changed successfully',
    });
  },
);
