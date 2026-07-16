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
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UpdateTourApprovalRequest {
  name?: string | null;
  price: number;
  description?: string | null;
  duration_minutes: number;
  location?: string | null;
  status: string;
  cancel_policy?: string | null;
  cancel_hours?: number | null;
}

const toUpdateRequest = (
  tour: TourApprovalItem,
  status: string,
): UpdateTourApprovalRequest => ({
  name: tour.name ?? '',
  price: tour.price ?? 0,
  description: tour.description ?? '',
  duration_minutes: tour.duration_minutes ?? tour.durationMinutes ?? 0,
  location: tour.location ?? '',
  status,
  cancel_policy: tour.cancel_policy ?? tour.cancelPolicy ?? 'free',
  cancel_hours: tour.cancel_hours ?? tour.cancelHours ?? null,
});

export const tourApprovalApi = {
  getTours: () => Api.get<ApiResponse<TourApprovalItem[]>>('/legacy/tours'),

  approveTour: (tour: TourApprovalItem) =>
    Api.put<ApiResponse<TourApprovalItem>>(
      `/legacy/tours/${tour.id}`,
      toUpdateRequest(tour, 'active'),
    ),

  rejectTour: (tour: TourApprovalItem) =>
    Api.put<ApiResponse<TourApprovalItem>>(
      `/legacy/tours/${tour.id}`,
      toUpdateRequest(tour, 'rejected'),
    ),
};
