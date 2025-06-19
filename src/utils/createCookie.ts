import { Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { IUser } from '@/interface/user.interface';

export const createCookie = (res: Response, user: IUser) => {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt_secret,
    {
      expiresIn: '7d',
    },
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
