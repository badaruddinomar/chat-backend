import jwt from 'jsonwebtoken';
import config from '@/config';
import { IUser } from '@/interface/user.interface';

export const createJwtToken = (user: IUser) => {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt_secret,
    {
      expiresIn: config.jwt_expiration,
    },
  );

  return token;
};
