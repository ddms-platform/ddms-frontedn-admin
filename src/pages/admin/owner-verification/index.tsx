import { useState } from 'react';
import {
  ShieldCheck,
  ShieldX,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type Status = 'pending' | 'verified' | 'rejected';

const OWNERS = [
  {
    id: 1,
    name: 'Công ty Du thuyền Phúc Hải',
    owner: 'Nguyễn Phúc Hải',
    email: 'phuchai@email.com',
    license: 'DL-2024-0091',
    submitted: '24/05/2026',
    status: 'pending' as Status,
    boats: 4,
  },
  {
    id: 2,
    name: 'HTX Tàu biển Cần Giờ',
    owner: 'Trần Văn Bình',
    email: 'tvanbinh@email.com',
    license: 'DL-2024-0088',
    submitted: '22/05/2026',
    status: 'pending' as Status,
    boats: 2,
  },
  {
    id: 3,
    name: 'TNHH Dịch vụ Biển Xanh',
    owner: 'Lê Thị Cẩm',
    email: 'ltcam@email.com',
    license: 'DL-2024-0085',
    submitted: '19/05/2026',
    status: 'pending' as Status,
    boats: 6,
  },
  {
    id: 4,
    name: 'Du thuyền Hoàng Gia',
    owner: 'Phạm Hoàng Dũng',
    email: 'phdung@email.com',
    license: 'DL-2024-0079',
    submitted: '15/05/2026',
    status: 'verified' as Status,
    boats: 8,
  },
  {
    id: 5,
    name: 'Tàu du lịch Mekong',
    owner: 'Võ Thị Emm',
    email: 'vtemm@email.com',
    license: 'DL-2024-0072',
    submitted: '10/05/2026',
    status: 'verified' as Status,
    boats: 3,
  },
  {
    id: 6,
    name: 'Công ty Tàu nhanh Phú Quốc',
    owner: 'Đỗ Minh Giang',
    email: 'dmgiang@email.com',
    license: 'DL-2024-0065',
    submitted: '05/05/2026',
    status: 'rejected' as Status,
    boats: 0,
  },
];

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

export default function AdminOwnerVerification() {
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [selected, setSelected] = useState<number | null>(null);

  const filtered =
    filter === 'all' ? OWNERS : OWNERS.filter((o) => o.status === filter);
  const selectedOwner = OWNERS.find((o) => o.id === selected);

  const pending = OWNERS.filter((o) => o.status === 'pending').length;
  const verified = OWNERS.filter((o) => o.status === 'verified').length;
  const rejected = OWNERS.filter((o) => o.status === 'rejected').length;

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
          const st = ST_MAP[o.status];
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
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: 'rgba(16,185,129,0.12)',
                          color: '#10B981',
                        }}
                      >
                        <ShieldCheck size={13} /> Xác thực
                      </button>
                      <button
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
                  className="mt-4 rounded-xl p-4"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: '#8892a0' }}
                  >
                    Thông tin giấy phép
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs" style={{ color: '#8892a0' }}>
                        Số giấy phép
                      </p>
                      <p
                        className="font-mono font-semibold"
                        style={{ color: '#fff' }}
                      >
                        {o.license}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: '#8892a0' }}>
                        Ảnh giấy phép
                      </p>
                      <div
                        className="mt-1 flex h-16 w-24 items-center justify-center rounded-lg text-xs"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px dashed rgba(255,255,255,0.1)',
                          color: '#8892a0',
                        }}
                      >
                        license.jpg
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
