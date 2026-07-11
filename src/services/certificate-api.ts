import { Api } from './axios';

export interface ApiResponse<T> {
  code: number;
  result: T;
}

export const CERTIFICATE_TYPES = [
  'registration',
  'insurance',
  'business_license',
  'safety_cert',
  'other',
] as const;

export type CertificateType = (typeof CERTIFICATE_TYPES)[number];

export type CertificateStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type ComplianceStatus = 'valid' | 'warning' | 'hidden' | 'locked';

export interface CertificateListItem {
  id: string;
  boatId: string;
  boatName: string;
  ownerName?: string;
  certificateType: CertificateType | string;
  documentUrl: string;
  expiryDate: string;
  status: CertificateStatus | string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTypeItem {
  id: number;
  code: string;
  nameVi: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateCertificateTypeRequest {
  code: string;
  nameVi: string;
  nameEn: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCertificateTypeRequest {
  nameVi: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
}

/** Fallback labels when types API has not loaded yet */
export const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
  registration: 'Đăng ký hàng hải',
  insurance: 'Bảo hiểm',
  business_license: 'Giấy phép kinh doanh',
  safety_cert: 'Chứng nhận an toàn',
  other: 'Khác',
};

export function buildTypeLabelMap(
  types: CertificateTypeItem[],
  locale: 'vi' | 'en' = 'vi',
): Record<string, string> {
  const map: Record<string, string> = { ...CERTIFICATE_TYPE_LABELS };
  types.forEach((t) => {
    map[t.code] = locale === 'en' ? t.nameEn : t.nameVi;
  });
  return map;
}

export const CERTIFICATE_STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: 'Chờ duyệt',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
  approved: {
    label: 'Đã duyệt',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
  },
  rejected: {
    label: 'Từ chối',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
  },
  expired: {
    label: 'Hết hạn',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.12)',
  },
};

export const COMPLIANCE_STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  valid: {
    label: 'Hợp lệ',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
  },
  warning: {
    label: 'Sắp hết hạn',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
  },
  hidden: {
    label: 'Tạm ẩn',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.12)',
  },
  locked: {
    label: 'Đã khóa',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
  },
};

export const certificateApi = {
  getPending: () =>
    Api.get<ApiResponse<CertificateListItem[]>>('/admin/certificates/pending'),

  getExpiring: () =>
    Api.get<ApiResponse<CertificateListItem[]>>('/admin/certificates/expiring'),

  approve: (certId: string) =>
    Api.post<ApiResponse<{ success: boolean }>>(
      `/admin/certificates/${certId}/approve`,
    ),

  reject: (certId: string, reason: string) =>
    Api.post<ApiResponse<{ success: boolean }>>(
      `/admin/certificates/${certId}/reject`,
      { reason },
    ),

  unlockBoat: (boatId: string) =>
    Api.post<ApiResponse<{ success: boolean }>>(
      `/admin/boats/${boatId}/unlock`,
    ),

  getTypes: () =>
    Api.get<ApiResponse<CertificateTypeItem[]>>('/admin/certificate-types'),

  createType: (data: CreateCertificateTypeRequest) =>
    Api.post<ApiResponse<CertificateTypeItem>>(
      '/admin/certificate-types',
      data,
    ),

  updateType: (id: number, data: UpdateCertificateTypeRequest) =>
    Api.put<ApiResponse<CertificateTypeItem>>(
      `/admin/certificate-types/${id}`,
      data,
    ),

  deleteType: (id: number) =>
    Api.del<ApiResponse<{ success: boolean }>>(
      `/admin/certificate-types/${id}`,
    ),
};
