import { useState } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  Shield,
  User,
  Crown,
  Trash2,
  Edit2,
} from 'lucide-react';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type Role = 'admin' | 'owner' | 'user';

const ROLE_MAP: Record<
  Role,
  { label: string; color: string; bg: string; icon: typeof User }
> = {
  admin: {
    label: 'Admin',
    color: '#FF385C',
    bg: 'rgba(255,56,92,0.12)',
    icon: Shield,
  },
  owner: {
    label: 'Owner',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    icon: Crown,
  },
  user: {
    label: 'User',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    icon: User,
  },
};

const USERS = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    roles: ['admin'] as Role[],
    joined: '01/01/2025',
    verified: true,
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    roles: ['owner'] as Role[],
    joined: '15/02/2025',
    verified: true,
  },
  {
    id: 3,
    name: 'Lê Hoàng C',
    email: 'lehoangc@email.com',
    roles: ['user'] as Role[],
    joined: '10/03/2025',
    verified: false,
  },
  {
    id: 4,
    name: 'Phạm Thùy D',
    email: 'phamthuyd@email.com',
    roles: ['user', 'owner'] as Role[],
    joined: '22/03/2025',
    verified: true,
  },
  {
    id: 5,
    name: 'Hoàng Minh E',
    email: 'hoangminhe@email.com',
    roles: ['user'] as Role[],
    joined: '05/04/2025',
    verified: true,
  },
  {
    id: 6,
    name: 'Võ Thanh F',
    email: 'vothanhf@email.com',
    roles: ['user'] as Role[],
    joined: '18/04/2025',
    verified: false,
  },
  {
    id: 7,
    name: 'Đỗ Quang G',
    email: 'doquangg@email.com',
    roles: ['owner'] as Role[],
    joined: '01/05/2025',
    verified: true,
  },
  {
    id: 8,
    name: 'Bùi Lan H',
    email: 'builanh@email.com',
    roles: ['user'] as Role[],
    joined: '12/05/2025',
    verified: false,
  },
];

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | Role>('all');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const filtered = USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.roles.includes(filterRole);
    return matchSearch && matchRole;
  });

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
            Quản lý tài khoản và phân quyền · {USERS.length} người dùng
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={16} /> Thêm người dùng
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {(['admin', 'owner', 'user'] as Role[]).map((role) => {
          const info = ROLE_MAP[role];
          const count = USERS.filter((u) => u.roles.includes(role)).length;
          return (
            <div
              key={role}
              className="rounded-2xl p-4 flex items-center gap-4"
              style={CARD}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: info.bg }}
              >
                <info.icon size={18} style={{ color: info.color }} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: '#fff' }}>
                  {count}
                </p>
                <p className="text-xs" style={{ color: '#8892a0' }}>
                  {info.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#8892a0' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên, email..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none transition-all"
            style={{
              backgroundColor: '#0d1629',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
            }}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'admin', 'owner', 'user'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold transition-all"
              style={
                filterRole === r
                  ? { backgroundColor: ACCENT, color: '#fff' }
                  : {
                      backgroundColor: '#0d1629',
                      color: '#8892a0',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {r === 'all' ? 'Tất cả' : ROLE_MAP[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
                  'Người dùng',
                  'Vai trò',
                  'Ngày tham gia',
                  'Trạng thái',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8892a0' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-white/2 transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0"
                        style={{
                          background: `linear-gradient(135deg,${ACCENT},#c00030)`,
                          color: '#fff',
                        }}
                      >
                        {u.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#fff' }}>
                          {u.name}
                        </p>
                        <p className="text-xs" style={{ color: '#8892a0' }}>
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((role) => {
                        const info = ROLE_MAP[role];
                        return (
                          <span
                            key={role}
                            className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: info.bg,
                              color: info.color,
                            }}
                          >
                            <info.icon size={10} />
                            {info.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: '#8892a0' }}
                  >
                    {u.joined}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold"
                      style={
                        u.verified
                          ? {
                              backgroundColor: 'rgba(16,185,129,0.12)',
                              color: '#10B981',
                            }
                          : {
                              backgroundColor: 'rgba(245,158,11,0.12)',
                              color: '#F59E0B',
                            }
                      }
                    >
                      {u.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenu(activeMenu === u.id ? null : u.id)
                        }
                        className="rounded-lg p-1.5 hover:bg-white/5 transition-colors"
                        style={{ color: '#8892a0' }}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeMenu === u.id && (
                        <div
                          className="absolute right-0 z-10 mt-1 w-44 rounded-xl overflow-hidden shadow-2xl"
                          style={{
                            backgroundColor: '#141e35',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <button
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: '#c8d0e0' }}
                          >
                            <Edit2 size={14} /> Chỉnh sửa
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: '#F59E0B' }}
                          >
                            <Shield size={14} /> Phân quyền
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 size={14} /> Xóa tài khoản
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm" style={{ color: '#8892a0' }}>
            Không tìm thấy người dùng nào
          </p>
        )}
      </div>
    </div>
  );
}
