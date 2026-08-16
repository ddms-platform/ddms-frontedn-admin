import { Api } from './axios';

export interface ApiResponse<T> {
  code: number;
  result: T;
}

export type CertificateType = string;

export type CertificateScope = 'boat' | 'owner';

export type OwnerEntityType = 'individual' | 'business' | 'cooperative';

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
  daysUntilExpiry?: number | null;
  isExpiringSoon?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerDocumentListItem {
  id: string;
  documentType: string;
  documentUrl: string;
  expiryDate?: string | null;
  adminNote?: string | null;
  isReuploaded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTypeItem {
  id: number;
  code: string;
  nameVi: string;
  nameEn: string;
  scope?: CertificateScope | string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateCertificateTypeRequest {
  code: string;
  nameVi: string;
  nameEn: string;
  scope?: CertificateScope | string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCertificateTypeRequest {
  nameVi: string;
  nameEn: string;
  scope?: CertificateScope | string;
  sortOrder: number;
  isActive: boolean;
}

/** Labels come from certificate_types API — do not hardcode names here. */
export function buildTypeLabelMap(
  types: CertificateTypeItem[],
  locale: 'vi' | 'en' = 'vi',
): Record<string, string> {
  const map: Record<string, string> = {};
  types.forEach((t) => {
    map[t.code] = locale === 'en' ? t.nameEn : t.nameVi;
  });
  return map;
}

export function typeLabel(
  code: string,
  labels?: Record<string, string> | null,
): string {
  return labels?.[code] || code;
}

export const OWNER_ENTITY_TYPE_LABELS: Record<string, string> = {
  individual: 'Cá nhân',
  business: 'Doanh nghiệp',
  cooperative: 'Hợp tác xã',
};

export const CERTIFICATE_SCOPE_LABELS: Record<CertificateScope, string> = {
  boat: 'Thuyền',
  owner: 'Chủ thuyền',
};

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

  getApproved: () =>
    Api.get<ApiResponse<CertificateListItem[]>>('/admin/certificates/approved'),

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

  getTypes: (scope?: CertificateScope | string) =>
    Api.get<ApiResponse<CertificateTypeItem[]>>('/admin/certificate-types', {
      params: scope ? { scope } : undefined,
    }),

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
