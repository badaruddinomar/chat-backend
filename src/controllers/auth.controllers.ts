import { Request, Response, NextFunction, RequestHandler } from 'express';
import catchAsync from '@/utils/catchAsync';
import AppError from '@/utils/AppError';
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status';
import sendEmail from '@/utils/sendEmail';
import { verifyEmailTemplate } from '@/emailTemplates/verifyEmailTemplate';
import { forgotPasswordEmailTemplate } from '@/emailTemplates/forgotPassEmailTemplate';
import { prisma } from '@/utils/prismaClient';
import { IUser } from '@/interface/user.interface';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '@/config';
import { createCookie } from '@/utils/createCookie';

export const register: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    // check if user exists--
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'User already exists!'));
    }

    // hash password--
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // create verify token--
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verifyCodeExpire = new Date(Date.now() + 1 * 60 * 1000); // 1 min from now

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verifyCode: verificationCode,
        verifyCodeExpire,
      },
    });

    // send verification email--
    await sendEmail({
      reciverEmail: newUser.email,
      subject: 'Verify your email',
      body: verifyEmailTemplate(verificationCode),
    });
    // send response to client--
    const {
      password: _password,
      verifyCode: _verifyCode,
      verifyCodeExpire: _verifyCodeExpire,
      forgotPasswordCode: _forgotPasswordCode,
      forgotPasswordCodeExpire: _forgotPasswordCodeExpire,
      ...userData
    } = newUser;
    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'user registered successfully',
      data: userData,
    });
  },
);

export const verifyEmail: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { verificationCode } = req.body;
    // 1. Check if the verification code is valid and not expired
    const user = await prisma.user.findFirst({
      where: {
        verifyCode: verificationCode,
        verifyCodeExpire: {
          gt: new Date(),
        },
      },
    });

    // if not valid--
    if (!user) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'Invalid code'));
    }
    // 3. Update the user as verified and clear the verification fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyCode: null,
        verifyCodeExpire: null,
      },
    });
    // send response to client--
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Email verified successfully',
    });
  },
);
export const resendVerifyCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(
        new AppError(
          httpStatus.NOT_FOUND,
          'User with this email does not exist!',
        ),
      );
    }

    if (user.isVerified) {
      return next(
        new AppError(httpStatus.BAD_REQUEST, 'Email is already verified!'),
      );
    }

    // Generate a new verification code
    const newVerificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const newVerifyCodeExpire = new Date(Date.now() + 1 * 60 * 1000);

    // Update user with the new verification code and expiry time
    await prisma.user.update({
      where: { email },
      data: {
        verifyCode: newVerificationCode,
        verifyCodeExpire: newVerifyCodeExpire,
      },
    });

    // Send the verification email
    await sendEmail({
      reciverEmail: user.email,
      subject: 'Resend Verify Code',
      body: verifyEmailTemplate(newVerificationCode),
    });

    // Respond to the client
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Verification code has been resent. Please check your email.',
    });
  },
);
export const login: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'Invalid credentials'));
    }
    // compare the password--
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'Invalid credentials'));
    }
    if (!user.isVerified) {
      return next(
        new AppError(httpStatus.UNAUTHORIZED, 'Please verify your email'),
      );
    }

    // Send response to client (exclude password)
    const {
      password: _password,
      verifyCode: _verifyCode,
      verifyCodeExpire: _verifyCodeExpire,
      forgotPasswordCode: _forgotPasswordCode,
      forgotPasswordCodeExpire: _forgotPasswordCodeExpire,
      ...userData
    } = user;
    createCookie(res, user as IUser);
    res.status(httpStatus.OK).json({
      success: true,
      message: 'user logged in successfully',
      data: userData,
    });
  },
);

export const forgotPassword: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'User not found'));
    }

    // 2. Generate code and expiry
    const forgotPasswordCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const forgotPasswordCodeExpire = new Date(Date.now() + 1 * 60 * 1000); // 1 mins

    // 3. Update user in DB
    await prisma.user.update({
      where: { email },
      data: {
        forgotPasswordCode,
        forgotPasswordCodeExpire,
      },
    });

    await sendEmail({
      reciverEmail: email,
      subject: 'Reset your password',
      body: forgotPasswordEmailTemplate(forgotPasswordCode),
    });

    // 5. Respond to client
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  },
);

export const verifyForgotPasswordCode: RequestHandler = catchAsync(
  async (req, res, next) => {
    const { email, forgotPasswordCode } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
        forgotPasswordCode,
        forgotPasswordCodeExpire: { gt: new Date() },
      },
    });

    if (!user) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'Invalid code'));
    }

    // Issue a short-lived reset token (expires in e.g., 10 mins)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'RESET_PASSWORD' },
      config.jwt_secret,
      {
        expiresIn: '10m',
      },
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Code verified successfully',
      meta: {
        resetToken,
      },
    });
  },
);

export const resetPassword: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'Reset token required'));
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, config.jwt_secret) as JwtPayload;
    } catch {
      return next(new AppError(httpStatus.BAD_REQUEST, 'Invalid token'));
    }

    if (payload.type !== 'RESET_PASSWORD') {
      return next(new AppError(httpStatus.BAD_REQUEST, 'Invalid reset token'));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return next(new AppError(httpStatus.NOT_FOUND, 'User not found'));
    }

    // 2. Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        forgotPasswordCode: null,
        forgotPasswordCodeExpire: null,
      },
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Password reset successfully',
    });
  },
);

export const logout: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(httpStatus.OK).json({
      success: true,
      message: 'user logged out successfully',
    });
  },
);
