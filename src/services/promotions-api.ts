import { Api } from './axios';

export interface ApiResponse<T> {
  code: number;
  message?: string | null;
  result: T;
}

export interface PromotionResponse {
  id: string;
  code: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string | null;
  creatorName: string;
  creatorEmail: string;
  creatorRole: 'admin' | 'owner';
  createdAt: string;
}

export interface CreatePromotionRequest {
  code: string;
  description?: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  validFrom: string;
  validUntil?: string | null;
}

export const promotionsApi = {
  // Admin Endpoints
  getAdminPromotions: () =>
    Api.get<ApiResponse<PromotionResponse[]>>('/admin/promotions'),

  createAdminPromotion: (data: CreatePromotionRequest) =>
    Api.post<ApiResponse<{ success: boolean; id: string }>>(
      '/admin/promotions',
      data,
    ),

  updateAdminPromotion: (id: string, data: CreatePromotionRequest) =>
    Api.put<ApiResponse<{ success: boolean }>>(`/admin/promotions/${id}`, data),

  deleteAdminPromotion: (id: string) =>
    Api.del<ApiResponse<{ success: boolean }>>(`/admin/promotions/${id}`),

  approvePromotion: (id: string) =>
    Api.post<ApiResponse<{ success: boolean }>>(
      `/admin/promotions/${id}/approve`,
    ),

  rejectPromotion: (id: string) =>
    Api.post<ApiResponse<{ success: boolean }>>(
      `/admin/promotions/${id}/reject`,
    ),

  toggleActivePromotion: (id: string) =>
    Api.post<ApiResponse<{ success: boolean; isActive: boolean }>>(
      `/admin/promotions/${id}/toggle`,
    ),

  // Owner Endpoints
  getOwnerPromotions: () =>
    Api.get<ApiResponse<PromotionResponse[]>>('/owner/promotions'),

  createOwnerPromotion: (data: CreatePromotionRequest) =>
    Api.post<ApiResponse<{ success: boolean; id: string }>>(
      '/owner/promotions',
      data,
    ),

  deleteOwnerPromotion: (id: string) =>
    Api.del<ApiResponse<{ success: boolean }>>(`/owner/promotions/${id}`),
};
