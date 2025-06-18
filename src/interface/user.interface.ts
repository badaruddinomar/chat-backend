type Role = 'USER' | 'ADMIN';
type avatar = {
  url: string;
  public_id: string;
};
export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  avatar?: avatar;
  role?: Role;
  verifyCode?: string;
  isVerified?: boolean;
  verifyCodeExpire?: Date;
  forgotPasswordCode?: string;
  forgotPasswordCodeExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
