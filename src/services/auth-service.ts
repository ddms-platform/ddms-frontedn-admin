import { Api, Axios } from './axios';
import { routeName } from '@/constants/route-name';
import { env } from '@/config/env';
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

const resource = env.API_URL_PREFIX;

const login = (payload: ILoginPayload) => {
  return Axios.post<ILoginRes>(`${resource}/login`, payload);
};

const register = (payload: IRegisterPayload) => {
  return Axios.post<IRegisterRes>(`${resource}/register`, payload);
};

const forgotPassword = (payload: IForgotPasswordPayload) => {
  return Axios.post(`${resource}/forgot-password`, payload);
};

const resetPassword = (payload: IResetPasswordPayload) => {
  return Axios.post(`${resource}/reset-password`, payload);
};

const refreshToken = (payload: IRefreshTokenPayload) => {
  return Axios.post<IRefreshTokenRes>(`${resource}/refresh-token`, payload);
};

const getProfile = () => {
  return Api.get<IProfileRes>(`${resource}/me`);
};

const changePassword = (payload: IChangePasswordPayload) => {
  return Api.post(`${resource}/change-password`, payload);
};

const logout = () => {
  return Api.post(`${resource}/logout`).finally(() => {
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
