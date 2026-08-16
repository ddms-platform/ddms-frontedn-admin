import { useState, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  Shield,
  User,
  Crown,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { Api } from '@/services/axios';
import { toast } from 'sonner';
import Pagination from '@/components/shared/pagination';

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

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  roles: Role[];
  isActive: boolean;
  emailVerified: boolean;
  ownerVerified: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | Role>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Role Assignment states
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [targetUser, setTargetUser] = useState<UserData | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);

  const fetchUsers = () => {
    setIsLoading(true);
    Api.get('/admin/users', { params: { pageSize: 1000 } })
      .then((res) => {
        if (res.status === 200 && res.data?.code === 1000) {
          setUsers(res.data.result.items || []);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch admin users:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: UserData) => {
    const actionText = user.isActive ? 'khóa' : 'mở khóa';
    if (confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) {
      try {
        let res;
        if (user.isActive) {
          res = await Api.del(`/admin/users/${user.id}`);
        } else {
          res = await Api.put(`/admin/users/${user.id}`, {
            fullName: user.fullName,
            phone: user.phone || '',
            isActive: true,
          });
        }

        if (res.status === 200) {
          toast.success(`Đã ${actionText} tài khoản thành công!`);
          fetchUsers();
        } else {
          toast.error(`Có lỗi xảy ra khi ${actionText} tài khoản.`);
        }
      } catch (err) {
        console.error(err);
        toast.error(`Có lỗi xảy ra khi ${actionText} tài khoản.`);
      }
    }
  };

  const handleUpdateRoles = async () => {
    if (!targetUser) return;
    if (selectedRoles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một vai trò');
      return;
    }
    setIsUpdatingRoles(true);
    try {
      const res = await Api.put(`/admin/users/${targetUser.id}/roles`, {
        roles: selectedRoles,
      });
      if (res.status === 200) {
        toast.success('Cập nhật quyền thành công!');
        setShowRolesModal(false);
        fetchUsers();
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật quyền.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi cập nhật quyền.');
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRole]);

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.roles.includes(filterRole);
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (isLoading) {
    return (
      <div className="flex h-[85vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-10 w-10 animate-spin"
            style={{ color: ACCENT }}
          />
          <p className="text-sm font-medium" style={{ color: '#8892a0' }}>
            Đang tải danh sách người dùng...
          </p>
        </div>
      </div>
    );
  }

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
            Quản lý tài khoản và phân quyền · {users.length} người dùng
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {(['admin', 'owner', 'user'] as Role[]).map((role) => {
          const info = ROLE_MAP[role];
          const count = users.filter((u) => u.roles.includes(role)).length;
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
              {paginatedUsers.map((u) => (
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
                        {(u.fullName || '')
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#fff' }}>
                          {u.fullName}
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
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span
                        className="rounded-lg px-2.5 py-1 text-[10px] font-semibold"
                        style={
                          u.isActive
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
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                      <span
                        className="text-[9px] font-medium"
                        style={{
                          color: u.emailVerified ? '#10B981' : '#F59E0B',
                        }}
                      >
                        {u.emailVerified ? '• Đã xác thực' : '• Chưa xác thực'}
                      </span>
                    </div>
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
                            onClick={() => {
                              setTargetUser(u);
                              setSelectedRoles(u.roles);
                              setShowRolesModal(true);
                              setActiveMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: '#F59E0B' }}
                          >
                            <Shield size={14} /> Phân quyền
                          </button>
                          <button
                            onClick={() => {
                              handleToggleActive(u);
                              setActiveMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                            style={{
                              color: u.isActive ? '#EF4444' : '#10B981',
                            }}
                          >
                            <Trash2 size={14} />{' '}
                            {u.isActive
                              ? 'Khóa tài khoản'
                              : 'Mở khóa tài khoản'}
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

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: '#8892a0' }}
            >
              <span>
                Hiển thị{' '}
                <strong style={{ color: '#fff' }}>
                  {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filtered.length)}
                </strong>{' '}
                trên tổng số{' '}
                <strong style={{ color: '#fff' }}>{filtered.length}</strong>{' '}
                người dùng
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer"
                style={{
                  backgroundColor: '#141e35',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {showRolesModal && targetUser && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRolesModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-sm rounded-2xl p-6 space-y-5 shadow-2xl z-50"
              style={{
                backgroundColor: '#141e35',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-white">
                  Phân quyền: {targetUser.fullName}
                </p>
                <button
                  onClick={() => setShowRolesModal(false)}
                  className="rounded-lg p-1.5 hover:bg-white/5 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Chọn vai trò cho người dùng:
                </p>
                {(['admin', 'owner', 'user'] as Role[]).map((role) => {
                  const isChecked = selectedRoles.includes(role);
                  const info = ROLE_MAP[role];
                  return (
                    <label
                      key={role}
                      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-white/5 transition-all select-none"
                      style={{
                        borderColor: isChecked
                          ? info.color
                          : 'rgba(255,255,255,0.06)',
                        backgroundColor: isChecked
                          ? `${info.bg}`
                          : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles([...selectedRoles, role]);
                          } else {
                            setSelectedRoles(
                              selectedRoles.filter((r) => r !== role),
                            );
                          }
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-rose-500 focus:ring-rose-500"
                      />
                      <div className="flex items-center gap-2">
                        <info.icon size={16} style={{ color: info.color }} />
                        <span
                          className="text-sm font-semibold capitalize"
                          style={{ color: isChecked ? '#fff' : '#c8d0e0' }}
                        >
                          {info.label}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateRoles}
                  disabled={isUpdatingRoles}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all text-white bg-rose-500 disabled:opacity-50"
                >
                  {isUpdatingRoles ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  onClick={() => setShowRolesModal(false)}
                  disabled={isUpdatingRoles}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-white/5 transition-all bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
