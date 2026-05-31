import { useState, useMemo, useEffect } from 'react';
import {
  Anchor,
  Plus,
  Search,
  Edit2,
  Trash2,
  Ship,
  X,
  Save,
  AlertTriangle,
  LayoutGrid,
  LayoutList,
  MapPin,
  CheckCircle,
  PauseCircle,
  ArrowUpRight,
  TrendingUp,
  Filter,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  dockApi,
  DockListItemResponse,
  DockStatsResponse,
} from '@/services/dock-api';

/* ─────────────────────── Design tokens ─────────────────────── */
const ACCENT = '#FF385C';
const ACCENT_BG = 'rgba(255,56,92,0.12)';
const CARD: React.CSSProperties = {
  backgroundColor: '#ffffff',
  boxShadow:
    'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
  borderRadius: '20px',
  border: '1px solid #e5e7eb',
};

/* ─────────────────────── Sub-components ─────────────────────── */

function CapacityBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  const barColor = pct > 85 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#10B981';
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 text-xs">
        <span style={{ color: '#6a6a6a' }}>
          <Ship size={10} className="inline mr-1" />
          {current}/{max} thuyền
        </span>
        <span className="font-bold" style={{ color: barColor }}>
          {pct}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full"
        style={{ backgroundColor: '#f2f2f2' }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────── Dock Form Modal ─────────────────────── */
function DockFormModal({
  editDock,
  onClose,
  onRefresh,
}: {
  editDock?: DockListItemResponse;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({
    name: editDock?.name ?? '',
    location: editDock?.location ?? '',
    maxBoats: String(editDock?.maxBoats ?? ''),
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.maxBoats) {
      toast.error('Vui lòng nhập tên và sức chứa');
      return;
    }
    setLoading(true);
    try {
      if (editDock) {
        await dockApi.update(editDock.id, {
          name: form.name,
          location: form.location,
          maxBoats: +form.maxBoats,
        });
        toast.success('Cập nhật bến tàu thành công');
      } else {
        await dockApi.create({
          name: form.name,
          location: form.location,
          maxBoats: +form.maxBoats,
        });
        toast.success('Thêm bến tàu mới thành công');
      }
      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg rounded-2xl p-6 space-y-5 pointer-events-auto shadow-2xl"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: ACCENT_BG }}
              >
                <Anchor size={16} style={{ color: ACCENT }} />
              </div>
              <p className="text-base font-bold" style={{ color: '#222222' }}>
                {editDock ? 'Chỉnh sửa bến tàu' : 'Thêm bến tàu mới'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-black/5"
              style={{ color: '#6a6a6a' }}
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label
                className="block text-[11px] font-semibold mb-1.5"
                style={{ color: '#6a6a6a' }}
              >
                Tên bến tàu *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Bến Tuần Châu"
                disabled={loading}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #c1c1c1',
                  color: '#222222',
                }}
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-[11px] font-semibold mb-1.5"
                style={{ color: '#6a6a6a' }}
              >
                Địa điểm
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="VD: Hạ Long, Quảng Ninh"
                disabled={loading}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #c1c1c1',
                  color: '#222222',
                }}
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-[11px] font-semibold mb-1.5"
                style={{ color: '#6a6a6a' }}
              >
                Số thuyền tối đa *
              </label>
              <input
                value={form.maxBoats}
                onChange={(e) => setForm({ ...form, maxBoats: e.target.value })}
                placeholder="20"
                type="number"
                disabled={loading}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #c1c1c1',
                  color: '#222222',
                }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              style={{ backgroundColor: ACCENT, color: '#ffffff' }}
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}{' '}
              {editDock ? 'Lưu thay đổi' : 'Tạo bến tàu'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-black/5 transition-all disabled:opacity-50"
              style={{ backgroundColor: '#f3f4f6', color: '#6a6a6a' }}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */
type ViewMode = 'card' | 'table';

export default function AdminDocks() {
  const [docks, setDocks] = useState<DockListItemResponse[]>([]);
  const [stats, setStats] = useState<DockStatsResponse>({
    total: 0,
    totalMaxBoats: 0,
  });

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [showForm, setShowForm] = useState(false);
  const [editDock, setEditDock] = useState<DockListItemResponse | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDocks();
  }, [page, search]);

  const fetchStats = async () => {
    try {
      const res = await dockApi.getStats();
      setStats(res.data.result);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDocks = async () => {
    setLoading(true);
    try {
      const query: any = { page, pageSize: 12 };
      if (search) query.search = search;

      const res = await dockApi.getDocks(query);
      setDocks(res.data.result.items);
      setTotalPages(res.data.result.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách bến tàu');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchDocks();
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await dockApi.delete(id);
      toast.success('Đã xóa bến tàu');
      setConfirmDelete(null);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const KPI = [
    {
      label: 'Tổng bến tàu',
      value: stats.total,
      icon: <Anchor size={18} />,
      color: ACCENT,
      bg: ACCENT_BG,
      sub: 'trên toàn hệ thống',
    },
    {
      label: 'Sức chứa tổng',
      value: stats.totalMaxBoats,
      icon: <ArrowUpRight size={18} />,
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.12)',
      sub: 'thuyền tối đa',
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#222222', letterSpacing: '-0.44px' }}
          >
            Quản lý Bến tàu
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6a6a6a' }}>
            Thêm, sửa, xóa bến tàu và quy định sức chứa
          </p>
        </div>
        <button
          onClick={() => {
            setEditDock(undefined);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: ACCENT, color: '#ffffff' }}
        >
          <Plus size={16} /> Thêm bến tàu
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={CARD}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: s.bg }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#222222' }}>
              {s.value}
            </p>
            <p
              className="text-xs font-semibold mt-0.5"
              style={{ color: '#6a6a6a' }}
            >
              {s.label}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#6a6a6a' }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#6a6a6a' }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm bến tàu hoặc địa điểm..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #c1c1c1',
              color: '#222222',
            }}
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#6a6a6a' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid #c1c1c1' }}
        >
          {(['card', 'table'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors"
              style={{
                backgroundColor:
                  viewMode === mode ? ACCENT_BG : 'rgba(255,255,255,0.03)',
                color: viewMode === mode ? ACCENT : '#6a6a6a',
              }}
            >
              {mode === 'card' ? (
                <LayoutGrid size={14} />
              ) : (
                <LayoutList size={14} />
              )}
              {mode === 'card' ? 'Thẻ' : 'Bảng'}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs" style={{ color: '#6a6a6a' }}>
        Hiển thị {docks.length} bến tàu
      </p>

      {/* CARD VIEW */}
      {viewMode === 'card' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading && docks.length === 0 ? (
            <div className="col-span-3 py-20 text-center">
              <Loader2
                size={24}
                className="mx-auto animate-spin text-gray-500"
              />
            </div>
          ) : docks.length === 0 ? (
            <div
              className="col-span-3 rounded-2xl py-20 text-center"
              style={CARD}
            >
              <Anchor
                size={36}
                className="mx-auto mb-3"
                style={{ color: '#6a6a6a' }}
              />
              <p className="text-sm" style={{ color: '#6a6a6a' }}>
                Không tìm thấy bến tàu nào
              </p>
            </div>
          ) : (
            docks.map((dock) => (
              <div
                key={dock.id}
                className="rounded-2xl p-5 space-y-4 transition-all hover:scale-[1.02] group"
                style={CARD}
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: ACCENT_BG }}
                    >
                      <Anchor size={18} style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: '#222222' }}
                      >
                        {dock.name}
                      </h3>
                      <p
                        className="text-[11px] flex items-center gap-1 mt-0.5"
                        style={{ color: '#6a6a6a' }}
                      >
                        <MapPin size={9} />
                        {dock.location || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Capacity bar (mock current 0 since we don't return current boats in API right now) */}
                <CapacityBar current={0} max={dock.maxBoats} />

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setEditDock(dock);
                      setShowForm(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: '#f3f4f6', color: '#222222' }}
                  >
                    <Edit2 size={12} /> Chỉnh sửa
                  </button>
                  <button
                    onClick={() => setConfirmDelete(dock.id)}
                    className="flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.1)',
                      color: '#EF4444',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-hidden rounded-2xl" style={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 700 }}>
              <thead style={{ backgroundColor: '#ffffff' }}>
                <tr className="text-left border-b">
                  {['Bến tàu', 'Địa điểm', 'Sức chứa', 'Cập nhật', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: '#6a6a6a' }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: 'rgba(0,0,0,0.04)' }}
              >
                {loading && docks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Loader2
                        size={24}
                        className="mx-auto animate-spin text-gray-500"
                      />
                    </td>
                  </tr>
                ) : docks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-sm"
                      style={{ color: '#6a6a6a' }}
                    >
                      Không tìm thấy bến tàu nào
                    </td>
                  </tr>
                ) : (
                  docks.map((dock) => (
                    <tr
                      key={dock.id}
                      className="group transition-colors hover:bg-black/2"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: ACCENT_BG }}
                          >
                            <Anchor size={14} style={{ color: ACCENT }} />
                          </div>
                          <p
                            className="text-xs font-semibold"
                            style={{ color: '#222222' }}
                          >
                            {dock.name}
                          </p>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: '#6a6a6a' }}
                      >
                        <div className="flex items-center gap-1">
                          <MapPin size={10} style={{ color: '#6a6a6a' }} />
                          {dock.location || '-'}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-semibold"
                        style={{ color: '#222222' }}
                      >
                        {dock.maxBoats}{' '}
                        <span
                          className="font-normal"
                          style={{ color: '#6a6a6a' }}
                        >
                          thuyền
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: '#6a6a6a' }}
                      >
                        {new Date(dock.updatedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditDock(dock);
                              setShowForm(true);
                            }}
                            className="rounded-lg p-1.5 hover:bg-black/5"
                            style={{ color: '#6a6a6a' }}
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(dock.id)}
                            className="rounded-lg p-1.5 hover:bg-red-500/10"
                            style={{ color: '#EF4444' }}
                            title="Xoá"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination placeholder */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setConfirmDelete(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
              >
                <AlertTriangle size={20} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: '#222222' }}
                >
                  Xác nhận xoá bến tàu
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>
                  {docks.find((d) => d.id === confirmDelete)?.name}
                </p>
              </div>
            </div>
            <p className="text-xs mb-5" style={{ color: '#6a6a6a' }}>
              Hành động này sẽ không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={loading}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#EF4444', color: '#ffffff' }}
              >
                {loading ? 'Đang xoá...' : 'Xoá bến tàu'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={loading}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#f3f4f6', color: '#6a6a6a' }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <DockFormModal
          editDock={editDock}
          onClose={() => {
            setShowForm(false);
            setEditDock(undefined);
          }}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
