import { useMemo } from 'react';

const BOATS = [
  {
    id: 1,
    name: 'Sapphire Dream',
    owner: 'Du thuyền Hoàng Gia',
    type: 'Luxury',
    capacity: 20,
    cabins: 8,
    status: 'active',
    dock: 'Bến Tuần Châu',
    maintenance: null,
  },
  {
    id: 2,
    name: 'Pearl of Halong',
    owner: 'Du thuyền Hoàng Gia',
    type: 'Premium',
    capacity: 16,
    cabins: 6,
    status: 'maintenance',
    dock: 'Bến Cát Bà',
    maintenance: '28/05/2026',
  },
  {
    id: 3,
    name: 'Emerald Mist',
    owner: 'HTX Tàu biển Cần Giờ',
    type: 'Standard',
    capacity: 12,
    cabins: 4,
    status: 'active',
    dock: 'Bến Bạch Đằng',
    maintenance: null,
  },
  {
    id: 4,
    name: 'Golden Dragon',
    owner: 'TNHH Biển Xanh',
    type: 'Luxury',
    capacity: 24,
    cabins: 10,
    status: 'active',
    dock: 'Bến Tuần Châu',
    maintenance: null,
  },
  {
    id: 5,
    name: 'Azure Wave',
    owner: 'Du thuyền Phúc Hải',
    type: 'Premium',
    capacity: 18,
    cabins: 7,
    status: 'idle',
    dock: 'Bến Nha Trang',
    maintenance: null,
  },
  {
    id: 6,
    name: 'Silver Moon',
    owner: 'Tàu du lịch Mekong',
    type: 'Standard',
    capacity: 10,
    cabins: 3,
    status: 'idle',
    dock: 'Bến Cần Thơ',
    maintenance: null,
  },
];

type Boat = (typeof BOATS)[number];

type StatusBadgeProps = {
  status: Boat['status'];
};

function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles: Record<Boat['status'], string> = {
    active: 'bg-emerald-500/10 text-emerald-300',
    maintenance: 'bg-amber-500/10 text-amber-300',
    idle: 'bg-slate-500/10 text-slate-300',
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export default function AdminBoats() {
  const summary = useMemo(
    () => ({
      total: BOATS.length,
      active: BOATS.filter((boat) => boat.status === 'active').length,
      maintenance: BOATS.filter((boat) => boat.status === 'maintenance').length,
      idle: BOATS.filter((boat) => boat.status === 'idle').length,
    }),
    [],
  );

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold">Quản lý Thuyền</h1>
        <p className="mt-1 text-sm text-slate-400">
          Danh sách thuyền demo cho trang Admin Boats.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Tổng số
          </p>
          <p className="mt-2 text-3xl font-semibold">{summary.total}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Đang hoạt động
          </p>
          <p className="mt-2 text-3xl font-semibold">{summary.active}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Bảo trì / nhàn rỗi
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {summary.maintenance + summary.idle}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-slate-950">
        <div className="overflow-x-auto">
          <table
            className="w-full divide-y divide-slate-700 text-sm"
            style={{ minWidth: 640 }}
          >
            <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Tên thuyền</th>
                <th className="px-4 py-3">Chủ</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Sức chứa</th>
                <th className="px-4 py-3">Bến</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Bảo trì</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {BOATS.map((boat) => (
                <tr key={boat.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-white">{boat.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {boat.owner}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {boat.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {boat.capacity}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {boat.dock}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={boat.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {boat.maintenance ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
