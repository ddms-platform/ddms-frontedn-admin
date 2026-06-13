import { Api, Axios } from './axios';
import { routeName } from '@/constants/route-name';
import { localStorageService } from './local-storage-service';
import type { IProfileRes } from '@/interfaces/profile';
import type {
  ILoginPayload,
  ILoginRes,
  IRegisterPayload,
  IRegisterRes,
  IForgotPasswordPayload,
  IResetPasswordPayload,
  IChangePasswordPayload,
  IRefreshTokenPayload,
  IRefreshTokenRes,
} from '@/interfaces/auth';

export interface ApiResponse<T> {
  code: number;
  result: T;
  message?: string;
}

const login = (payload: ILoginPayload) => {
  return Axios.post<ApiResponse<ILoginRes>>('/auth/login', payload);
};

const register = (payload: IRegisterPayload) => {
  return Axios.post<ApiResponse<IRegisterRes>>('/auth/register', payload);
};

const forgotPassword = (payload: IForgotPasswordPayload) => {
  return Axios.post('/auth/forgot-password', payload);
};

const resetPassword = (payload: IResetPasswordPayload) => {
  return Axios.post('/auth/reset-password', payload);
};

const refreshToken = (payload: IRefreshTokenPayload) => {
  return Axios.post<ApiResponse<IRefreshTokenRes>>(
    '/auth/refresh-token',
    payload,
  );
};

const getProfile = () => {
  return Api.get<ApiResponse<IProfileRes>>('/auth/me');
};

const changePassword = (payload: IChangePasswordPayload) => {
  return Api.post('/auth/change-password', payload);
};

const logout = () => {
  return Api.post('/auth/logout').finally(() => {
    localStorageService.clearAccessToken();
    window.location.href = routeName.signIn;
  });
};

export const AuthServices = {
  login,
  register,
  forgotPassword,
  resetPassword,
  refreshToken,
  getProfile,
  changePassword,
  logout,
};
