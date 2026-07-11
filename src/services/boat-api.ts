import { Api } from './axios';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface BoatImageResponse {
  id: string;
  boatId: string;
  imageUrl: string;
  publicId?: string;
  caption?: string;
  sortOrder: number;
  createdAt: string;
}

export interface BoatCabinResponse {
  id: string;
  boatId: string;
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoatServiceResponse {
  id: string;
  boatId: string;
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoatListItemResponse {
  id: string;
  name: string;
  type?: string;
  maxPassengers: number;
  status: string;
  complianceStatus?: string;
  cabinCount: number;
  serviceCount: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoatDetailResponse {
  id: string;
  name: string;
  type?: string;
  maxPassengers: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  cabins: BoatCabinResponse[];
  services: BoatServiceResponse[];
  images: BoatImageResponse[];
}

export interface BoatStatsResponse {
  total: number;
  active: number;
  maintenance: number;
  idle: number;
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
// Query params
// ────────────────────────────────────────────────────────────

export interface BoatListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  type?: string;
}

// ────────────────────────────────────────────────────────────
// Request bodies
// ────────────────────────────────────────────────────────────

export interface CreateBoatRequest {
  name: string;
  type?: string;
  maxPassengers: number;
  status?: string;
}

export interface UpdateBoatRequest {
  name: string;
  type?: string;
  maxPassengers: number;
  status: string;
}

export interface CreateBoatCabinRequest {
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
}

export interface UpdateBoatCabinRequest {
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
}

export interface CreateBoatServiceRequest {
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface UpdateBoatServiceRequest {
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface UploadBoatImageRequest {
  fileBase64: string;
  caption?: string;
}

// ────────────────────────────────────────────────────────────
// API functions — Boats (Admin)
// ────────────────────────────────────────────────────────────

export const boatApi = {
  // Boats CRUD
  getBoats: (query: BoatListQuery = {}) =>
    Api.get<ApiResponse<PagedResponse<BoatListItemResponse>>>('/admin/boats', {
      params: query,
    }),

  getStats: () => Api.get<ApiResponse<BoatStatsResponse>>('/admin/boats/stats'),

  getAll: () =>
    Api.get<ApiResponse<BoatListItemResponse[]>>('/admin/boats/all'),

  getById: (id: string) =>
    Api.get<ApiResponse<BoatDetailResponse>>(`/admin/boats/${id}`),

  create: (data: CreateBoatRequest) =>
    Api.post<ApiResponse<BoatDetailResponse>>('/admin/boats', data),

  update: (id: string, data: UpdateBoatRequest) =>
    Api.put<ApiResponse<BoatDetailResponse>>(`/admin/boats/${id}`, data),

  delete: (id: string) =>
    Api.del<ApiResponse<{ deleted: boolean }>>(`/admin/boats/${id}`),

  // Cabins (nested)
  getCabins: (boatId: string) =>
    Api.get<ApiResponse<BoatCabinResponse[]>>(`/admin/boats/${boatId}/cabins`),

  createCabin: (boatId: string, data: CreateBoatCabinRequest) =>
    Api.post<ApiResponse<BoatCabinResponse>>(
      `/admin/boats/${boatId}/cabins`,
      data,
    ),

  updateCabin: (
    boatId: string,
    cabinId: string,
    data: UpdateBoatCabinRequest,
  ) =>
    Api.put<ApiResponse<BoatCabinResponse>>(
      `/admin/boats/${boatId}/cabins/${cabinId}`,
      data,
    ),

  deleteCabin: (boatId: string, cabinId: string) =>
    Api.del<ApiResponse<{ deleted: boolean }>>(
      `/admin/boats/${boatId}/cabins/${cabinId}`,
    ),

  // Services/Addons (nested)
  getServices: (boatId: string) =>
    Api.get<ApiResponse<BoatServiceResponse[]>>(
      `/admin/boats/${boatId}/services`,
    ),

  createService: (boatId: string, data: CreateBoatServiceRequest) =>
    Api.post<ApiResponse<BoatServiceResponse>>(
      `/admin/boats/${boatId}/services`,
      data,
    ),

  updateService: (
    boatId: string,
    serviceId: string,
    data: UpdateBoatServiceRequest,
  ) =>
    Api.put<ApiResponse<BoatServiceResponse>>(
      `/admin/boats/${boatId}/services/${serviceId}`,
      data,
    ),

  toggleService: (boatId: string, serviceId: string) =>
    Api.patch<ApiResponse<BoatServiceResponse>>(
      `/admin/boats/${boatId}/services/${serviceId}/toggle`,
    ),

  deleteService: (boatId: string, serviceId: string) =>
    Api.del<ApiResponse<{ deleted: boolean }>>(
      `/admin/boats/${boatId}/services/${serviceId}`,
    ),

  // Images (nested) — Cloudinary upload
  getImages: (boatId: string) =>
    Api.get<ApiResponse<BoatImageResponse[]>>(`/admin/boats/${boatId}/images`),

  uploadImage: (boatId: string, data: UploadBoatImageRequest) =>
    Api.post<ApiResponse<BoatImageResponse>>(
      `/admin/boats/${boatId}/images`,
      data,
    ),

  deleteImage: (boatId: string, imageId: string) =>
    Api.del<ApiResponse<{ deleted: boolean }>>(
      `/admin/boats/${boatId}/images/${imageId}`,
    ),
};
