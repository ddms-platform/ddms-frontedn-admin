import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldX,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Phone,
  MapPin,
  Mail,
  FileText,
  Ship,
  Info,
} from 'lucide-react';
import { Api } from '@/services/axios';
import { toast } from 'sonner';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type Status = 'pending' | 'verified' | 'rejected';

const ST_MAP: Record<
  Status,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: {
    label: 'Đang chờ',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    icon: Clock,
  },
  verified: {
    label: 'Đã xác thực',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Từ chối',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    icon: XCircle,
  },
};

interface VesselData {
  id: string;
  name: string;
  type: string;
  length?: number;
  beam?: number;
  registrationNumber: string;
  mooringType: string;
  expectedDockingDate: string;
  requiredServices: string[];
  documentUrls: string[];
  imageUrls: string[];
  status: string;
}

interface OwnerData {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  license: string;
  submitted: string;
  status: Status;
  boats: number;
  vessels?: VesselData[];
}

export default function AdminOwnerVerification() {
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const fetchOwners = () => {
    setIsLoading(true);
    Api.get('/admin/owners/verifications')
      .then((res) => {
        if (res.status === 200 && res.data?.code === 1000) {
          const list = (res.data.result || []).map((o: any) => ({
            ...o,
            status: o.status === 'approved' ? 'verified' : o.status,
          }));
          setOwners(list);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch owners verifications:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOwners();
  }, []);

  const handleApprove = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn duyệt hồ sơ chủ thuyền này?')) {
      try {
        const res = await Api.post(`/admin/owners/verifications/${id}/approve`);
        if (res.status === 200) {
          toast.success('Đã duyệt hồ sơ chủ thuyền thành công!');
          fetchOwners();
        } else {
          toast.error('Có lỗi xảy ra khi duyệt hồ sơ.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi duyệt hồ sơ.');
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn từ chối hồ sơ chủ thuyền này?')) {
      try {
        const res = await Api.post(`/admin/owners/verifications/${id}/reject`);
        if (res.status === 200) {
          toast.success('Đã từ chối hồ sơ thành công!');
          fetchOwners();
        } else {
          toast.error('Có lỗi xảy ra khi từ chối hồ sơ.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi từ chối hồ sơ.');
      }
    }
  };

  const filtered =
    filter === 'all' ? owners : owners.filter((o) => o.status === filter);

  const pending = owners.filter((o) => o.status === 'pending').length;
  const verified = owners.filter((o) => o.status === 'verified').length;
  const rejected = owners.filter((o) => o.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className="flex h-[85vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-10 w-10 animate-spin"
            style={{ color: ACCENT }}
          />
          <p className="text-sm font-medium" style={{ color: '#8892a0' }}>
            Đang tải danh sách xác thực...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: '#fff', letterSpacing: '-0.44px' }}
        >
          Xác thực Chủ thuyền
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
          Kiểm duyệt hồ sơ kinh doanh của đối tác chủ thuyền
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Chờ xét duyệt',
            value: pending,
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.12)',
            icon: Clock,
          },
          {
            label: 'Đã xác thực',
            value: verified,
            color: '#10B981',
            bg: 'rgba(16,185,129,0.12)',
            icon: CheckCircle,
          },
          {
            label: 'Đã từ chối',
            value: rejected,
            color: '#EF4444',
            bg: 'rgba(239,68,68,0.12)',
            icon: XCircle,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={CARD}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#fff' }}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: '#8892a0' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'verified', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-xl px-4 py-2 text-xs font-semibold transition-all"
            style={
              filter === f
                ? { backgroundColor: ACCENT, color: '#fff' }
                : {
                    backgroundColor: '#0d1629',
                    color: '#8892a0',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
            }
          >
            {f === 'all' ? 'Tất cả' : ST_MAP[f].label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((o) => {
          const st = ST_MAP[o.status] || ST_MAP.pending;
          const Icon = st.icon;
          return (
            <div
              key={o.id}
              className="rounded-2xl p-5 transition-all hover:scale-[1.005]"
              style={CARD}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3
                      className="text-base font-semibold"
                      style={{ color: '#fff' }}
                    >
                      {o.name}
                    </h3>
                    <span
                      className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: st.bg, color: st.color }}
                    >
                      <Icon size={11} />
                      {st.label}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: '#8892a0' }}>
                    Đại diện:{' '}
                    <span style={{ color: '#c8d0e0' }}>{o.owner}</span> ·{' '}
                    {o.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#8892a0' }}
                      >
                        Giấy phép
                      </p>
                      <p
                        className="text-sm font-mono font-semibold"
                        style={{ color: '#fff' }}
                      >
                        {o.license}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#8892a0' }}
                      >
                        Ngày nộp
                      </p>
                      <p className="text-sm" style={{ color: '#fff' }}>
                        {o.submitted}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: '#8892a0' }}
                      >
                        Số thuyền
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: '#fff' }}
                      >
                        {o.boats}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#c8d0e0',
                    }}
                    onClick={() => setSelected(selected === o.id ? null : o.id)}
                  >
                    <Eye size={13} /> Xem hồ sơ
                  </button>
                  {o.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(o.id)}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: 'rgba(16,185,129,0.12)',
                          color: '#10B981',
                        }}
                      >
                        <ShieldCheck size={13} /> Xác thực
                      </button>
                      <button
                        onClick={() => handleReject(o.id)}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: 'rgba(239,68,68,0.12)',
                          color: '#EF4444',
                        }}
                      >
                        <ShieldX size={13} /> Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* Expanded detail */}
              {selected === o.id && (
                <div
                  className="mt-4 rounded-xl p-5 space-y-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 text-rose-400">
                      <Info size={14} /> Thông tin hồ sơ đăng ký
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1"
                          style={{ color: '#8892a0' }}
                        >
                          Doanh nghiệp / Hộ kinh doanh
                        </p>
                        <p className="font-semibold text-white">{o.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1"
                          style={{ color: '#8892a0' }}
                        >
                          Người đại diện
                        </p>
                        <p className="font-semibold text-white">{o.owner}</p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: '#8892a0' }}
                        >
                          <Phone size={12} /> Số điện thoại
                        </p>
                        <p className="font-semibold text-white">{o.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: '#8892a0' }}
                        >
                          <Mail size={12} /> Email liên hệ
                        </p>
                        <p className="font-semibold text-white">{o.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1"
                          style={{ color: '#8892a0' }}
                        >
                          Số giấy phép kinh doanh
                        </p>
                        <p className="font-mono font-semibold text-white">
                          {o.license}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: '#8892a0' }}
                        >
                          <MapPin size={12} /> Địa chỉ đăng ký
                        </p>
                        <p className="font-semibold text-white">{o.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Registered Vessels */}
                  {o.vessels && o.vessels.length > 0 && (
                    <div className="border-t border-white/5 pt-5 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#8892a0] flex items-center gap-1.5">
                        <Ship size={14} /> Danh sách tàu thuyền đăng ký (
                        {o.vessels.length})
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        {o.vessels.map((vessel) => (
                          <div
                            key={vessel.id}
                            className="rounded-xl p-4 space-y-4"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.015)',
                              border: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            <div className="flex flex-col lg:flex-row gap-4 justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-base">
                                    {vessel.name}
                                  </span>
                                  <span
                                    className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                                    style={{
                                      backgroundColor: 'rgba(59,130,246,0.12)',
                                      color: '#3B82F6',
                                    }}
                                  >
                                    {vessel.type}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                  <div>
                                    <p
                                      className="text-[10px] uppercase tracking-wider"
                                      style={{ color: '#8892a0' }}
                                    >
                                      Số đăng ký
                                    </p>
                                    <p className="font-semibold text-white mt-0.5 font-mono">
                                      {vessel.registrationNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className="text-[10px] uppercase tracking-wider"
                                      style={{ color: '#8892a0' }}
                                    >
                                      Kích thước
                                    </p>
                                    <p className="font-semibold text-white mt-0.5">
                                      {vessel.length
                                        ? `${vessel.length}m`
                                        : 'N/A'}{' '}
                                      ×{' '}
                                      {vessel.beam ? `${vessel.beam}m` : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className="text-[10px] uppercase tracking-wider"
                                      style={{ color: '#8892a0' }}
                                    >
                                      Loại neo đậu
                                    </p>
                                    <p className="font-semibold text-white mt-0.5">
                                      {vessel.mooringType}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className="text-[10px] uppercase tracking-wider"
                                      style={{ color: '#8892a0' }}
                                    >
                                      Ngày cập bến dự kiến
                                    </p>
                                    <p className="font-semibold text-white mt-0.5">
                                      {vessel.expectedDockingDate}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Images and Documents */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                              {/* Images */}
                              <div>
                                <p
                                  className="text-[11px] font-bold uppercase tracking-wider mb-2"
                                  style={{ color: '#8892a0' }}
                                >
                                  Hình ảnh tàu thuyền
                                </p>
                                {vessel.imageUrls &&
                                vessel.imageUrls.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {vessel.imageUrls.map((url, idx) => (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative group block overflow-hidden rounded-lg border border-white/10 shrink-0"
                                      >
                                        <img
                                          src={url}
                                          alt={`boat-img-${idx}`}
                                          className="h-16 w-24 object-cover transition-transform group-hover:scale-105"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <p
                                    className="text-xs italic"
                                    style={{ color: '#8892a0' }}
                                  >
                                    Không có hình ảnh đính kèm
                                  </p>
                                )}
                              </div>

                              {/* Documents */}
                              <div>
                                <p
                                  className="text-[11px] font-bold uppercase tracking-wider mb-2"
                                  style={{ color: '#8892a0' }}
                                >
                                  Hồ sơ / Tài liệu đính kèm
                                </p>
                                {vessel.documentUrls &&
                                vessel.documentUrls.length > 0 ? (
                                  <div className="flex flex-col gap-1.5">
                                    {vessel.documentUrls.map((url, idx) => (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors w-fit"
                                      >
                                        <FileText size={12} />
                                        <span>
                                          Giấy đăng ký / Hồ sơ kỹ thuật #
                                          {idx + 1}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <p
                                    className="text-xs italic"
                                    style={{ color: '#8892a0' }}
                                  >
                                    Không có tài liệu đính kèm
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Required Services */}
                            {vessel.requiredServices &&
                              vessel.requiredServices.length > 0 && (
                                <div className="pt-3 border-t border-white/5">
                                  <p
                                    className="text-[11px] font-bold uppercase tracking-wider mb-2"
                                    style={{ color: '#8892a0' }}
                                  >
                                    Dịch vụ yêu cầu
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {vessel.requiredServices.map(
                                      (service, sidx) => (
                                        <span
                                          key={sidx}
                                          className="text-[10px] px-2.5 py-0.5 rounded-md font-medium"
                                          style={{
                                            backgroundColor:
                                              'rgba(255,255,255,0.05)',
                                            color: '#c8d0e0',
                                            border:
                                              '1px solid rgba(255,255,255,0.05)',
                                          }}
                                        >
                                          {service}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
