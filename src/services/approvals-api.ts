import { Api } from './axios';

export interface ApiResponse<T> {
  code: number;
  result: T;
}

export interface MaintenanceResponse {
  id: string;
  boatId: string;
  boatName: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  createdAt: string;
  portMaintenanceServiceId: string | null;
  portMaintenanceServiceName: string;
  price: number;
  status: string;
}

export interface WithdrawalResponse {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
}

export const approvalsApi = {
  getMaintenances: () =>
    Api.get<ApiResponse<MaintenanceResponse[]>>('/admin/maintenances'),

  approveMaintenance: (id: string) =>
    Api.post<ApiResponse<{ success: boolean }>>(
      `/admin/maintenances/${id}/approve`,
    ),

  rejectMaintenance: (id: string) =>
    Api.post<ApiResponse<{ success: boolean }>>(
      `/admin/maintenances/${id}/reject`,
    ),

  getWithdrawals: () =>
    Api.get<ApiResponse<WithdrawalResponse[]>>('/admin/withdrawals'),

  approveWithdrawal: (id: string) =>
    Api.post<ApiResponse<{ success: boolean }>>(
      `/admin/withdrawals/${id}/approve`,
    ),

  rejectWithdrawal: (id: string) =>
    Api.post<ApiResponse<{ success: boolean }>>(
      `/admin/withdrawals/${id}/reject`,
    ),
};
