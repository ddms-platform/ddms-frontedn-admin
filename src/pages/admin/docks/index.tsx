import { useState } from 'react';
import { Plus, Anchor, Edit2, Trash2, Ship } from 'lucide-react';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

const DOCKS = [
  {
    id: 1,
    name: 'Bến Tuần Châu',
    location: 'Hạ Long, Quảng Ninh',
    maxBoats: 20,
    currentBoats: 15,
    active: true,
  },
  {
    id: 2,
    name: 'Bến Cát Bà',
    location: 'Cát Bà, Hải Phòng',
    maxBoats: 12,
    currentBoats: 8,
    active: true,
  },
  {
    id: 3,
    name: 'Bến Bạch Đằng',
    location: 'Quận 1, TP.HCM',
    maxBoats: 30,
    currentBoats: 22,
    active: true,
  },
  {
    id: 4,
    name: 'Bến Cần Thơ',
    location: 'Ninh Kiều, Cần Thơ',
    maxBoats: 10,
    currentBoats: 4,
    active: true,
  },
  {
    id: 5,
    name: 'Bến Nha Trang',
    location: 'Nha Trang, Khánh Hòa',
    maxBoats: 18,
    currentBoats: 11,
    active: false,
  },
  {
    id: 6,
    name: 'Bến Phú Quốc',
    location: 'Dương Đông, Kiên Giang',
    maxBoats: 25,
    currentBoats: 19,
    active: true,
  },
];

export default function AdminDocks() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', maxBoats: '' });

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            Quản lý Bến tàu
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
            Thêm, sửa, xóa bến tàu và quy định sức chứa
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={16} /> Thêm bến tàu
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl p-6 space-y-4" style={CARD}>
          <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
            Thêm bến tàu mới
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Tên bến tàu',
                key: 'name',
                placeholder: 'VD: Bến Tuần Châu',
              },
              {
                label: 'Địa điểm',
                key: 'location',
                placeholder: 'VD: Hạ Long, Quảng Ninh',
              },
              {
                label: 'Số thuyền tối đa',
                key: 'maxBoats',
                placeholder: 'VD: 20',
              },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#8892a0' }}
                >
                  {label}
                </label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
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
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              Lưu
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:bg-white/5"
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

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Tổng bến tàu', value: DOCKS.length },
          {
            label: 'Đang hoạt động',
            value: DOCKS.filter((d) => d.active).length,
          },
          {
            label: 'Tổng thuyền đang neo',
            value: DOCKS.reduce((s, d) => s + d.currentBoats, 0),
          },
          {
            label: 'Sức chứa tổng',
            value: DOCKS.reduce((s, d) => s + d.maxBoats, 0),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 text-center"
            style={CARD}
          >
            <p className="text-2xl font-bold" style={{ color: '#fff' }}>
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8892a0' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Dock cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCKS.map((dock) => {
          const pct = Math.round((dock.currentBoats / dock.maxBoats) * 100);
          const barColor =
            pct > 85 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#10B981';
          return (
            <div
              key={dock.id}
              className="rounded-2xl p-5 space-y-4 transition-all hover:scale-[1.02]"
              style={CARD}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(255,56,92,0.1)' }}
                  >
                    <Anchor size={18} style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#fff' }}>
                      {dock.name}
                    </h3>
                    <p className="text-xs" style={{ color: '#8892a0' }}>
                      {dock.location}
                    </p>
                  </div>
                </div>
                <span
                  className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                  style={
                    dock.active
                      ? {
                          backgroundColor: 'rgba(16,185,129,0.12)',
                          color: '#10B981',
                        }
                      : {
                          backgroundColor: 'rgba(239,68,68,0.12)',
                          color: '#EF4444',
                        }
                  }
                >
                  {dock.active ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: '#8892a0' }}>
                    <Ship size={11} className="inline mr-1" />
                    {dock.currentBoats}/{dock.maxBoats} thuyền
                  </span>
                  <span className="font-semibold" style={{ color: barColor }}>
                    {pct}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#c8d0e0',
                  }}
                >
                  <Edit2 size={12} /> Chỉnh sửa
                </button>
                <button
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    color: '#EF4444',
                  }}
                >
                  <Trash2 size={12} /> Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
