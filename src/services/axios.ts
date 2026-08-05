import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  HttpStatusCode,
} from 'axios';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { env } from '@/config/env';
import { localStorageService } from './local-storage-service';
import { localStorageKey } from '@/constants/local-storage';
import { ApiErrorConstant } from '@/constants/apiError';
import { routeName } from '@/constants/route-name';

// Global state for user disabled dialog
let showUserDisabledDialog: (() => void) | null = null;

export const setUserDisabledDialogHandler = (handler: (() => void) | null) => {
  showUserDisabledDialog = handler;
};
const apiUrl = env.API_URL;
const apiUrlPrefix = env.API_URL_PREFIX ?? 'api';
const baseUrlApi = `${apiUrl}/${apiUrlPrefix}`;

export interface ResponseBase<T = any> {
  status: number;
  data: T & DataResponseErrorBase;
}

export interface DataResponseErrorBase {
  code: string | number;
  errors?: Error422[];
}

export interface Error422 {
  field: string;
  message: string;
  rule: string;
}

const api = axios.create({
  baseURL: baseUrlApi,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const Axios = axios.create({
  baseURL: baseUrlApi,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    throw error;
  },
);

Axios.interceptors.request.use((config) => {
  const token = localStorageService.getItem(localStorageKey.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.request.use((config) => {
  const token = localStorageService.getItem(localStorageKey.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === HttpStatusCode.ServiceUnavailable) {
      if (window.location.pathname !== routeName.maintenance) {
        window.location.href = routeName.maintenance;
      }
      return;
    }
    if (error.response?.status === HttpStatusCode.Unauthorized) {
      // Check if user is disabled
      if (error.response?.data?.code === ApiErrorConstant.USER_DISABLED) {
        if (showUserDisabledDialog) {
          showUserDisabledDialog();
        } else {
          toast.error(i18n.t('error.USER_DISABLED'));
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = routeName.signIn;
        }
        return;
      }

      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = routeName.signIn;
    }
    return error.response;
  },
);

const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .get(url, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.status as number,
        data: error.response?.data,
      };
    });
};

const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .post(url, data, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.response?.status as number,
        data: error.response?.data,
      };
    });
};

const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .put(url, data, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.status as number,
        data: error.response?.data,
      };
    });
};

const patch = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .patch(url, data, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.status as number,
        data: error.response?.data,
      };
    });
};

const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig<any> | undefined,
): Promise<ResponseBase<T>> => {
  return api
    .delete(url, config)
    .then((response: AxiosResponse) => {
      return { status: response.status, data: response.data };
    })
    .catch((error) => {
      return {
        status: error.response?.status as number,
        data: error.response?.data,
      };
    });
};

export const Api = { get, post, put, patch, del };
