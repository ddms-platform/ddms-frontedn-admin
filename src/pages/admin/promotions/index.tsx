import { useState } from 'react';
import {
  Plus,
  Tag,
  Edit2,
  Trash2,
  Percent,
  BadgeDollarSign,
} from 'lucide-react';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type DiscountType = 'percentage' | 'fixed';

const PROMOTIONS = [
  {
    id: 1,
    code: 'SUMMER26',
    type: 'percentage' as DiscountType,
    value: 15,
    minOrder: 2000000,
    usageLimit: 500,
    used: 312,
    from: '01/06/2026',
    to: '31/08/2026',
    active: true,
  },
  {
    id: 2,
    code: 'HALONG50K',
    type: 'fixed' as DiscountType,
    value: 50000,
    minOrder: 500000,
    usageLimit: 200,
    used: 87,
    from: '15/05/2026',
    to: '15/06/2026',
    active: true,
  },
  {
    id: 3,
    code: 'NEWUSER20',
    type: 'percentage' as DiscountType,
    value: 20,
    minOrder: 1000000,
    usageLimit: 1000,
    used: 1000,
    from: '01/01/2026',
    to: '31/12/2026',
    active: false,
  },
  {
    id: 4,
    code: 'WEEKEND10',
    type: 'percentage' as DiscountType,
    value: 10,
    minOrder: 0,
    usageLimit: 999,
    used: 234,
    from: '01/05/2026',
    to: '31/05/2026',
    active: true,
  },
];

export default function AdminPromotions() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            Quản lý Khuyến mãi
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
            Tạo và quản lý mã giảm giá cho toàn hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={16} /> Tạo mã mới
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Tổng mã',
            value: PROMOTIONS.length,
            color: '#FF385C',
            bg: 'rgba(255,56,92,0.12)',
          },
          {
            label: 'Đang active',
            value: PROMOTIONS.filter((p) => p.active).length,
            color: '#10B981',
            bg: 'rgba(16,185,129,0.12)',
          },
          {
            label: 'Đã dùng (tổng)',
            value: PROMOTIONS.reduce((s, p) => s + p.used, 0),
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.12)',
          },
          {
            label: 'Hết lượt dùng',
            value: PROMOTIONS.filter((p) => p.used >= p.usageLimit).length,
            color: '#8B5CF6',
            bg: 'rgba(139,92,246,0.12)',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={CARD}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: s.bg }}
            >
              <Tag size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: '#fff' }}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: '#8892a0' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl p-6 space-y-4" style={CARD}>
          <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
            Tạo mã khuyến mãi
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Mã giảm giá', placeholder: 'VD: SUMMER26' },
              { label: 'Loại giảm giá', placeholder: 'percentage / fixed' },
              { label: 'Giá trị', placeholder: 'VD: 15 hoặc 50000' },
              { label: 'Đơn hàng tối thiểu (₫)', placeholder: 'VD: 500000' },
              { label: 'Giới hạn lượt dùng', placeholder: 'VD: 500' },
              { label: 'Ngày bắt đầu', placeholder: 'dd/mm/yyyy' },
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#8892a0' }}
                >
                  {label}
                </label>
                <input
                  placeholder={placeholder}
                  className="w-full rounded-xl py-2.5 px-4 text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              Lưu
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-white/5"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#c8d0e0',
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Promotions table */}
      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {[
                  'Mã',
                  'Loại',
                  'Giá trị',
                  'Đơn tối thiểu',
                  'Lượt dùng',
                  'Thời hạn',
                  'Trạng thái',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8892a0' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROMOTIONS.map((p) => {
                const exhausted = p.used >= p.usageLimit;
                return (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-white/2 transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                          style={{ backgroundColor: 'rgba(255,56,92,0.1)' }}
                        >
                          {p.type === 'percentage' ? (
                            <Percent size={13} style={{ color: ACCENT }} />
                          ) : (
                            <BadgeDollarSign
                              size={13}
                              style={{ color: ACCENT }}
                            />
                          )}
                        </div>
                        <span
                          className="font-mono font-semibold"
                          style={{ color: '#fff' }}
                        >
                          {p.code}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-5 py-3.5 text-xs"
                      style={{ color: '#8892a0' }}
                    >
                      {p.type === 'percentage' ? 'Phần trăm' : 'Cố định'}
                    </td>
                    <td
                      className="px-5 py-3.5 font-semibold"
                      style={{ color: ACCENT }}
                    >
                      {p.type === 'percentage'
                        ? `${p.value}%`
                        : `₫${p.value.toLocaleString()}`}
                    </td>
                    <td
                      className="px-5 py-3.5 text-xs"
                      style={{ color: '#8892a0' }}
                    >
                      {p.minOrder ? `₫${p.minOrder.toLocaleString()}` : 'Không'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: '#8892a0' }}>
                            {p.used}/{p.usageLimit}
                          </span>
                        </div>
                        <div
                          className="h-1 w-24 rounded-full"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                        >
                          <div
                            className="h-1 rounded-full"
                            style={{
                              width: `${Math.min((p.used / p.usageLimit) * 100, 100)}%`,
                              backgroundColor: exhausted
                                ? '#EF4444'
                                : '#10B981',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-5 py-3.5 text-xs"
                      style={{ color: '#8892a0' }}
                    >
                      {p.from} – {p.to}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="rounded-lg px-2.5 py-1 text-[10px] font-semibold"
                        style={
                          p.active && !exhausted
                            ? {
                                backgroundColor: 'rgba(16,185,129,0.12)',
                                color: '#10B981',
                              }
                            : exhausted
                              ? {
                                  backgroundColor: 'rgba(139,92,246,0.12)',
                                  color: '#8B5CF6',
                                }
                              : {
                                  backgroundColor: 'rgba(239,68,68,0.12)',
                                  color: '#EF4444',
                                }
                        }
                      >
                        {exhausted
                          ? 'Hết lượt'
                          : p.active
                            ? 'Đang chạy'
                            : 'Tắt'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button
                          className="rounded-lg p-1.5 hover:bg-white/5 transition-colors"
                          style={{ color: '#8892a0' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="rounded-lg p-1.5 hover:bg-white/5 transition-colors"
                          style={{ color: '#EF4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
