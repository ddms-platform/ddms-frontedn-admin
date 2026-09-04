import { Api } from './axios';

export interface ApiResponse<T> {
  code: number;
  result: T;
}

export interface TourApprovalItem {
  id: string;
  name?: string | null;
  price: number;
  description?: string | null;
  duration_minutes?: number | null;
  durationMinutes?: number | null;
  /** Số khách tối đa chủ thuyền khai cho tour. Null = chưa khai. */
  max_guests?: number | null;
  maxGuests?: number | null;
  location?: string | null;
  avg_rating?: number | null;
  avgRating?: number | null;
  total_reviews?: number | null;
  totalReviews?: number | null;
  status?: string | null;
  cancel_policy?: string | null;
  cancelPolicy?: string | null;
  cancel_hours?: number | null;
  cancelHours?: number | null;
  rejection_reason?: string | null;
  rejectionReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UpdateTourApprovalRequest {
  name?: string | null;
  price: number;
  description?: string | null;
  duration_minutes: number;
  max_guests?: number | null;
  location?: string | null;
  status: string;
  cancel_policy?: string | null;
  cancel_hours?: number | null;
  rejection_reason?: string | null;
}

const toUpdateRequest = (
  tour: TourApprovalItem,
  status: string,
  rejectionReason?: string | null,
): UpdateTourApprovalRequest => ({
  name: tour.name ?? '',
  price: tour.price ?? 0,
  description: tour.description ?? '',
  duration_minutes: tour.duration_minutes ?? tour.durationMinutes ?? 0,
  // Phải gửi lại, không thì PUT duyệt/từ chối ghi đè max_guests thành null và
  // tour mất luôn giới hạn khách chủ thuyền đã khai.
  max_guests: tour.max_guests ?? tour.maxGuests ?? null,
  location: tour.location ?? '',
  status,
  cancel_policy: tour.cancel_policy ?? tour.cancelPolicy ?? 'free',
  cancel_hours: tour.cancel_hours ?? tour.cancelHours ?? null,
  rejection_reason:
    status === 'rejected' ? rejectionReason?.trim() || null : null,
});

export const tourApprovalApi = {
  getTours: () => Api.get<ApiResponse<TourApprovalItem[]>>('/legacy/tours'),

  approveTour: (tour: TourApprovalItem) =>
    Api.put<ApiResponse<TourApprovalItem>>(
      `/legacy/tours/${tour.id}`,
      toUpdateRequest(tour, 'active'),
    ),

  rejectTour: (tour: TourApprovalItem, reason: string) =>
    Api.put<ApiResponse<TourApprovalItem>>(
      `/legacy/tours/${tour.id}`,
      toUpdateRequest(tour, 'rejected', reason),
    ),
};

export interface ServiceChangeProposed {
  name?: string;
  basePrice?: number;
  serviceType?: string;
  description?: string;
  rooms?: { name: string; price?: number }[];
  combos?: { name: string; price?: number }[];
}

export interface ServiceChangeItem {
  id: string;
  tourId: string;
  tourName: string;
  tourStatus?: string | null;
  currentPrice: number;
  boatId: string;
  boatName?: string | null;
  ownerId: string;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  proposed?: ServiceChangeProposed | null;
}

export const serviceChangeApi = {
  list: (status?: string) =>
    Api.get<ApiResponse<ServiceChangeItem[]>>('/admin/service-changes', {
      params: status ? { status } : undefined,
    }),

  approve: (id: string) =>
    Api.post<ApiResponse<ServiceChangeItem>>(
      `/admin/service-changes/${id}/approve`,
    ),

  reject: (id: string, reason: string) =>
    Api.post<ApiResponse<ServiceChangeItem>>(
      `/admin/service-changes/${id}/reject`,
      { reason },
    ),
};
