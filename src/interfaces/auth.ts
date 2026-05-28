import type { User } from '@/data/user';

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ILoginRes {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface IRegisterRes {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}

export interface IRefreshTokenRes {
  accessToken: string;
  refreshToken: string;
}
