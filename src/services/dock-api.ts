import { Api } from './axios';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface DockListItemResponse {
  id: string;
  name: string;
  location?: string;
  maxBoats: number;
  createdAt: string;
  updatedAt: string;
}

export interface DockStatsResponse {
  total: number;
  totalMaxBoats: number;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  code: number;
  result: T;
}

// ────────────────────────────────────────────────────────────
// Query params & Request bodies
// ────────────────────────────────────────────────────────────

export interface DockListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateDockRequest {
  name: string;
  location?: string;
  maxBoats: number;
}

export interface UpdateDockRequest {
  name: string;
  location?: string;
  maxBoats: number;
}

// ────────────────────────────────────────────────────────────
// API functions — Docks (Admin)
// ────────────────────────────────────────────────────────────

export const dockApi = {
  getDocks: (query: DockListQuery = {}) =>
    Api.get<ApiResponse<PagedResponse<DockListItemResponse>>>('/admin/docks', {
      params: query,
    }),

  getStats: () => Api.get<ApiResponse<DockStatsResponse>>('/admin/docks/stats'),

  getAll: () =>
    Api.get<ApiResponse<DockListItemResponse[]>>('/admin/docks/all'),

  getById: (id: string) =>
    Api.get<ApiResponse<DockListItemResponse>>(`/admin/docks/${id}`),

  create: (data: CreateDockRequest) =>
    Api.post<ApiResponse<DockListItemResponse>>('/admin/docks', data),

  update: (id: string, data: UpdateDockRequest) =>
    Api.put<ApiResponse<DockListItemResponse>>(`/admin/docks/${id}`, data),

  delete: (id: string) =>
    Api.del<ApiResponse<{ deleted: boolean }>>(`/admin/docks/${id}`),

  getSchedules: (dockId: string) =>
    Api.get<ApiResponse<DockScheduleResponse[]>>(
      `/admin/docks/${dockId}/schedules`,
    ),

  addSchedule: (dockId: string, data: CreateDockScheduleRequest) =>
    Api.post<ApiResponse<DockScheduleResponse>>(
      `/admin/docks/${dockId}/schedules`,
      data,
    ),

  deleteSchedule: (dockId: string, scheduleId: string) =>
    Api.del<ApiResponse<{ deleted: boolean }>>(
      `/admin/docks/${dockId}/schedules/${scheduleId}`,
    ),

  /** Danh sach khoang ben mo, theo dung thu tu so do. */
  getBerths: (dockId: string) =>
    Api.get<ApiResponse<string[]>>(`/admin/docks/${dockId}/berths`),

  /** Gan khoang neo cho mot lich neo. Truyen chuoi rong de go khoang. */
  assignBerth: (dockScheduleId: string, berthCode: string | null) =>
    Api.put<ApiResponse<{ id: string; berthCode: string | null }>>(
      `/admin/docks/schedules/${dockScheduleId}/berth`,
      { berthCode },
    ),
};

export interface DockScheduleResponse {
  id: string;
  dockId: string;
  boatId: string;
  boatName: string;
  scheduleId?: string;
  /** Khoang neo cang vu da gan, vi du "A12". Rong khi chua gan. */
  berthCode?: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface CreateDockScheduleRequest {
  boatId: string;
  startTime: string;
  endTime: string;
}
