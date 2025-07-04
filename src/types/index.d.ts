import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '@/interface/user.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user: JwtPayload | IUser;
  }
}
declare module 'socket.io' {
  interface Socket {
    user?: IUser | string;
  }
}
