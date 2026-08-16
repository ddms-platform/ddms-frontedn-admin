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
  ArrowUpRight,
  Loader2,
  Layers,
  Droplets,
  Camera,
  Calendar,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dockApi } from '@/services/dock-api';
import type {
  DockListItemResponse,
  DockStatsResponse,
  DockScheduleResponse,
} from '@/services/dock-api';
import { boatApi } from '@/services/boat-api';
import type { BoatListItemResponse } from '@/services/boat-api';

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

// Generate 32 slots: 8 slots per side for 2 piers
const generateSlots = () => {
  const slots = [];
  const startX = 18;
  const gapX = 10; // 8 slots from 18 to 88

  // Pier A (Top: 20%, Bottom: 20%) -> Boats at 8% and 32%
  for (let i = 0; i < 8; i++) {
    slots.push({
      id: `A${i + 1}`,
      x: startX + i * gapX,
      y: 8,
      rotate: 180,
      pier: 'Cầu tàu A (Phía trên)',
    });
    slots.push({
      id: `A${i + 9}`,
      x: startX + i * gapX,
      y: 32,
      rotate: 0,
      pier: 'Cầu tàu A (Phía dưới)',
    });
  }

  // Pier B (Top: 65%, Bottom: 65%) -> Boats at 53% and 77%
  for (let i = 0; i < 8; i++) {
    slots.push({
      id: `B${i + 1}`,
      x: startX + i * gapX,
      y: 53,
      rotate: 180,
      pier: 'Cầu tàu B (Phía trên)',
    });
    slots.push({
      id: `B${i + 9}`,
      x: startX + i * gapX,
      y: 77,
      rotate: 0,
      pier: 'Cầu tàu B (Phía dưới)',
    });
  }

  return slots;
};

const ALL_SLOTS = generateSlots();

const TopDownBoatSVG = ({ color }: { color: string }) => (
  <svg
    viewBox="0 0 100 280"
    className="w-8 h-auto drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
  >
    {/* Hull */}
    <path
      d="M 50 0 C 95 60, 90 220, 85 260 L 15 260 C 10 220, 5 60, 50 0 Z"
      fill={color}
      stroke="#ffffff"
      strokeWidth="3"
    />
    {/* Sun Deck (Front) */}
    <path
      d="M 50 30 C 75 60, 75 90, 75 90 L 25 90 C 25 90, 25 60, 50 30 Z"
      fill="#e2e8f0"
    />
    {/* Cockpit Roof */}
    <path
      d="M 20 100 L 80 100 L 75 220 L 25 220 Z"
      fill="#f8fafc"
      stroke="#94a3b8"
      strokeWidth="2"
    />
    {/* Windshield */}
    <path
      d="M 25 105 Q 50 85, 75 105 L 70 120 Q 50 105, 30 120 Z"
      fill="#0ea5e9"
      opacity="0.8"
    />
    {/* Rear Deck */}
    <rect x="25" y="220" width="50" height="35" fill="#cbd5e1" />
    {/* Outboard Motors */}
    <rect x="30" y="260" width="12" height="15" fill="#1e293b" rx="2" />
    <rect x="58" y="260" width="12" height="15" fill="#1e293b" rx="2" />
  </svg>
);

const getBoatColor = (boatId: string, status: string) => {
  if (status === 'maintenance') return '#94A3B8';
  const colors = [
    '#FF385C',
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
  ];
  let sum = 0;
  for (let i = 0; i < boatId.length; i++) {
    sum += boatId.charCodeAt(i);
  }
  return colors[sum % colors.length];
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
type ViewMode = 'card' | 'table' | 'map';

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

  // Map view states
  const [selectedDockId, setSelectedDockId] = useState<string>('');
  const [schedules, setSchedules] = useState<DockScheduleResponse[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [availableBerths, setAvailableBerths] = useState<string[]>([]);
  const [allBoats, setAllBoats] = useState<BoatListItemResponse[]>([]);
  const [selectedBoatDetails, setSelectedBoatDetails] = useState<any | null>(
    null,
  );

  // Assign modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetSlot, setAssignTargetSlot] = useState<string>('');
  const [assignForm, setAssignForm] = useState({
    boatId: '',
    startTime: new Date().toISOString().substring(0, 16),
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 16),
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDocks();
  }, [page, search]);

  useEffect(() => {
    if (docks.length > 0 && !selectedDockId) {
      setSelectedDockId(docks[0].id);
    }
  }, [docks]);

  const fetchSchedules = async (dockId: string) => {
    if (!dockId) return;
    setSchedulesLoading(true);
    try {
      const res = await dockApi.getSchedules(dockId);
      if (res.status === 200 && res.data?.result) {
        setSchedules(res.data.result);
      }
    } catch (error) {
      console.error('Không thể tải lịch neo đậu:', error);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchBerths = async (dockId: string) => {
    if (!dockId) return;
    try {
      const res = await dockApi.getBerths(dockId);
      if (res.status === 200 && res.data?.result) {
        setAvailableBerths(res.data.result);
      }
    } catch (error) {
      console.error('Khong the tai danh sach khoang:', error);
    }
  };

  /** Cang vu gan khoang cho mot lich neo. Chuoi rong = go khoang. */
  const handleAssignBerth = async (
    dockScheduleId: string,
    berthCode: string,
  ) => {
    try {
      await dockApi.assignBerth(dockScheduleId, berthCode || null);
      await fetchSchedules(selectedDockId);
    } catch (error: any) {
      // Server chan khi khoang khong co tren so do, vuot suc chua ben, hoac da
      // co tau khac dau trong cung khoang thoi gian.
      alert(error?.message ?? 'Khong gan duoc khoang neo.');
    }
  };

  const fetchAllBoats = async () => {
    try {
      const res = await boatApi.getAll();
      if (res.status === 200 && res.data?.result) {
        setAllBoats(res.data.result);
      }
    } catch (error) {
      console.error('Không thể tải danh sách thuyền:', error);
    }
  };

  useEffect(() => {
    if (viewMode === 'map') {
      fetchAllBoats();
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'map' && selectedDockId) {
      fetchSchedules(selectedDockId);
      fetchBerths(selectedDockId);
    }
  }, [viewMode, selectedDockId]);

  const handleAddSchedule = async () => {
    if (!assignForm.boatId || !assignForm.startTime || !assignForm.endTime) {
      toast.error('Vui lòng chọn tàu và thời gian neo đậu');
      return;
    }
    try {
      const res = await dockApi.addSchedule(selectedDockId, {
        boatId: assignForm.boatId,
        startTime: new Date(assignForm.startTime).toISOString(),
        endTime: new Date(assignForm.endTime).toISOString(),
      });
      if (res.status === 200) {
        toast.success('Cấp bến cho tàu thành công');
        setShowAssignModal(false);
        fetchSchedules(selectedDockId);
        fetchStats();
        fetchDocks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cấp bến');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!scheduleId) return;
    try {
      const res = await dockApi.deleteSchedule(selectedDockId, scheduleId);
      if (res.status === 200) {
        toast.success('Đã giải phóng bến cho tàu');
        setSelectedBoatDetails(null);
        fetchSchedules(selectedDockId);
        fetchStats();
        fetchDocks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const selectedDock = useMemo(() => {
    return docks.find((d) => d.id === selectedDockId) || null;
  }, [docks, selectedDockId]);

  const activeSlots = useMemo(() => {
    if (!selectedDock) return [];
    return ALL_SLOTS.slice(0, selectedDock.maxBoats);
  }, [selectedDock]);

  const activeScheduledBoats = useMemo(() => {
    if (!selectedDock || !schedules) return [];
    const now = new Date();

    const active = schedules.filter((s) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      return start <= now && end >= now;
    });

    return active
      .map((schedule) => {
        // Khoang do cang vu gan va luu trong DB. Truoc day suy ra tu vi tri
        // trong mang, nen cung mot con tau ra khoang khac nhau giua trang nay
        // (duyet moi tau) va trang owner (chi loc tau cua minh), va con tu doi
        // moi khi co tau khac vao hoac roi ben.
        const slot = ALL_SLOTS.find((sl) => sl.id === schedule.berthCode);
        if (!slot) return null;

        const boatDetail = allBoats.find((b) => b.id === schedule.boatId);

        return {
          ...boatDetail,
          id: schedule.boatId,
          name: schedule.boatName || boatDetail?.name || 'Tàu không tên',
          slotName: slot.id,
          x: slot.x,
          y: slot.y,
          rotate: slot.rotate,
          pier: slot.pier,
          scheduleId: schedule.id,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          status: boatDetail?.status || 'idle',
          maxPassengers: boatDetail?.maxPassengers || 0,
          cabinCount: boatDetail?.cabinCount || 0,
          serviceCount: boatDetail?.serviceCount || 0,
          thumbnailUrl: boatDetail?.thumbnailUrl,
        };
      })
      .filter(Boolean) as Array<any>;
  }, [selectedDock, schedules, allBoats]);

  const formatScheduleTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ' ' +
        d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
      );
    } catch (e) {
      return '';
    }
  };

  const occupancy = activeScheduledBoats.length;
  const capacity = selectedDock?.maxBoats || 0;
  const percent =
    capacity > 0 ? Math.min(100, Math.round((occupancy / capacity) * 100)) : 0;

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
          {(['card', 'table', 'map'] as const).map((mode) => (
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
              ) : mode === 'table' ? (
                <LayoutList size={14} />
              ) : (
                <Anchor size={14} />
              )}
              {mode === 'card' ? 'Thẻ' : mode === 'table' ? 'Bảng' : 'Bản đồ'}
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

      {/* MAP VIEW */}
      {viewMode === 'map' && (
        <div className="flex flex-col xl:flex-row gap-6 items-stretch w-full max-w-400 mx-auto">
          {/* Left Side: Map Canvas */}
          <div className="relative flex-1 min-h-150 xl:min-h-187.5 rounded-3xl border-4 border-slate-200 shadow-xl overflow-hidden bg-[#004e7c]">
            {/* Animated Water Background */}
            <div className="absolute inset-0 bg-linear-to-b from-[#0077a3] via-[#004e7c] to-[#002f4b]"></div>

            {/* Sunlight Reflection */}
            <div className="absolute top-0 left-0 w-full h-[30%] bg-linear-to-b from-white/10 to-transparent pointer-events-none"></div>

            {/* Water Caustics ripple effect */}
            <div
              className="absolute inset-0 opacity-15 mix-blend-color-dodge pointer-events-none"
              style={{
                backgroundImage:
                  'url("https://www.transparenttextures.com/patterns/water.png")',
                animation: 'drift 25s linear infinite',
              }}
            ></div>

            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes drift {
                from { background-position: 0 0; }
                to { background-position: 200px 200px; }
              }
            `,
              }}
            />

            {/* Mainland harbour wall */}
            <div className="absolute top-0 left-0 w-20 h-full bg-[#cbd5e1] border-r-[6px] border-[#94a3b8] flex flex-col justify-center items-center shadow-lg">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-80 mix-blend-multiply"></div>
              <div className="absolute top-0 right-2 w-1.5 h-full bg-yellow-400 opacity-80"></div>

              {/* Control Tower / Harbor Master office */}
              <div className="relative z-10 w-24 h-32 bg-slate-800 border-4 border-slate-700 shadow-2xl flex items-center justify-center -mr-12 rounded-lg">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-50"></div>
                <div className="w-10 h-10 rounded-full border-2 border-cyan-500/50 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Pier A Structure */}
            {selectedDock && selectedDock.maxBoats > 0 && (
              <div
                className="absolute top-[20%] left-20 w-[82%] h-12 bg-[#8b5a2b] shadow-lg z-10 rounded-r-md"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, #8b5a2b, #8b5a2b 10px, #704620 10px, #704620 13px)',
                }}
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-40 mix-blend-multiply"></div>

                {/* Pier Fenders */}
                {[18, 28, 38, 48, 58, 68, 78, 88].map((pos, i) => {
                  const hasTopSlot = selectedDock.maxBoats > i;
                  const hasBottomSlot = selectedDock.maxBoats > i + 8;
                  if (!hasTopSlot && !hasBottomSlot) return null;
                  return (
                    <div key={`fenderA-${i}`}>
                      {hasTopSlot && (
                        <div
                          className="absolute -top-1.5 w-4 h-1.5 bg-slate-900 rounded-full"
                          style={{
                            left: `${pos}%`,
                            transform: 'translateX(-50%)',
                          }}
                        ></div>
                      )}
                      {hasBottomSlot && (
                        <div
                          className="absolute -bottom-1.5 w-4 h-1.5 bg-slate-900 rounded-full"
                          style={{
                            left: `${pos}%`,
                            transform: 'translateX(-50%)',
                          }}
                        ></div>
                      )}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-400 rounded-full"
                        style={{
                          left: `${pos}%`,
                          transform: 'translateX(-50%)',
                        }}
                      ></div>
                    </div>
                  );
                })}
                <span className="absolute top-1/2 -translate-y-1/2 left-6 text-white/90 font-black tracking-widest text-[11px] bg-black/40 px-2 py-0.5 rounded">
                  CẦU TÀU A
                </span>
              </div>
            )}

            {/* Pier B Structure */}
            {selectedDock && selectedDock.maxBoats > 16 && (
              <div
                className="absolute top-[65%] left-20 w-[82%] h-12 bg-[#8b5a2b] shadow-lg z-10 rounded-r-md"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, #8b5a2b, #8b5a2b 10px, #704620 10px, #704620 13px)',
                }}
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-40 mix-blend-multiply"></div>

                {[18, 28, 38, 48, 58, 68, 78, 88].map((pos, i) => {
                  const hasTopSlot = selectedDock.maxBoats > i + 16;
                  const hasBottomSlot = selectedDock.maxBoats > i + 24;
                  if (!hasTopSlot && !hasBottomSlot) return null;
                  return (
                    <div key={`fenderB-${i}`}>
                      {hasTopSlot && (
                        <div
                          className="absolute -top-1.5 w-4 h-1.5 bg-slate-900 rounded-full"
                          style={{
                            left: `${pos}%`,
                            transform: 'translateX(-50%)',
                          }}
                        ></div>
                      )}
                      {hasBottomSlot && (
                        <div
                          className="absolute -bottom-1.5 w-4 h-1.5 bg-slate-900 rounded-full"
                          style={{
                            left: `${pos}%`,
                            transform: 'translateX(-50%)',
                          }}
                        ></div>
                      )}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-400 rounded-full"
                        style={{
                          left: `${pos}%`,
                          transform: 'translateX(-50%)',
                        }}
                      ></div>
                    </div>
                  );
                })}
                <span className="absolute top-1/2 -translate-y-1/2 left-6 text-white/90 font-black tracking-widest text-[11px] bg-black/40 px-2 py-0.5 rounded">
                  CẦU TÀU B
                </span>
              </div>
            )}

            {/* Render slots overlay */}
            {schedulesLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xs">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            ) : (
              activeSlots.map((slot, idx) => {
                const boat = activeScheduledBoats.find(
                  (b) => b.slotName === slot.id,
                );
                return (
                  <div
                    key={`bay-${idx}`}
                    onClick={() => {
                      if (boat) {
                        setSelectedBoatDetails(boat);
                      } else {
                        setAssignTargetSlot(slot.id);
                        setAssignForm({
                          ...assignForm,
                          boatId: '',
                          startTime: new Date().toISOString().substring(0, 16),
                          endTime: new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000,
                          )
                            .toISOString()
                            .substring(0, 16),
                        });
                        setShowAssignModal(true);
                      }
                    }}
                    className={`absolute border border-dashed rounded-xl z-20 flex flex-col justify-between p-1.5 cursor-pointer transition-all duration-200 group ${
                      boat
                        ? 'border-transparent hover:bg-white/5'
                        : 'border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10'
                    }`}
                    style={{
                      top:
                        slot.y < 20
                          ? '4%'
                          : slot.y < 40
                            ? '24%'
                            : slot.y < 60
                              ? '49%'
                              : '69%',
                      left: `calc(${slot.x}% - 4%)`, // 8% width bay
                      width: '8%',
                      height: '16%',
                      justifyContent:
                        slot.rotate === 180 ? 'flex-start' : 'flex-end',
                    }}
                  >
                    {/* Slot label */}
                    <div className="flex justify-between items-center w-full z-10">
                      <span className="text-white/40 font-bold text-[9px] bg-slate-950/40 px-1 rounded">
                        {slot.id}
                      </span>
                      {!boat && (
                        <Plus
                          size={10}
                          className="text-white/30 group-hover:text-cyan-400 transition-colors"
                        />
                      )}
                    </div>

                    {/* Boat SVG */}
                    {boat && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className="relative"
                          style={{ transform: `rotate(${boat.rotate}deg)` }}
                        >
                          {/* wake */}
                          <div className="absolute left-1/2 -translate-x-1/2 w-8 h-10 bg-white/10 blur-md rounded-full -z-10 animate-pulse"></div>
                          <TopDownBoatSVG
                            color={getBoatColor(boat.id, boat.status)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Simple hover card */}
                    {boat && (
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 bg-slate-900/95 px-2.5 py-1.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-30 pointer-events-none scale-90 group-hover:scale-100 ${boat.rotate === 180 ? 'top-10' : '-top-14'}`}
                      >
                        <div className="text-[10px] font-bold text-white mb-0.5">
                          {boat.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1 h-1 rounded-full ${boat.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
                          ></span>
                          <span className="text-[8px] font-semibold text-slate-300 uppercase">
                            {boat.status === 'running' ? 'Chạy' : 'Chờ'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Side: Sidebar Controller */}
          <div
            className="w-full xl:w-95 bg-white rounded-3xl border border-gray-200 p-6 flex flex-col gap-6 shrink-0 shadow-lg justify-between"
            style={CARD}
          >
            <div className="flex flex-col gap-5">
              {/* Dock Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold tracking-wider text-gray-500 uppercase flex items-center gap-1">
                  <Anchor className="w-3.5 h-3.5 text-rose-500" /> Chọn Bến Neo
                  Đậu
                </label>
                <div className="relative">
                  <select
                    value={selectedDockId}
                    onChange={(e) => setSelectedDockId(e.target.value)}
                    className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none cursor-pointer transition-all"
                  >
                    {docks.map((dock) => (
                      <option key={dock.id} value={dock.id}>
                        {dock.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Occupancy Indicator */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Sức chứa bến</span>
                  <span className="text-gray-800 font-bold">
                    {capacity} khoang
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Thuyền đang đậu</span>
                  <span className="text-rose-500 font-bold">
                    {occupancy} thuyền
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 rounded-full ${
                        percent > 85
                          ? 'bg-red-500'
                          : percent > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 font-medium flex justify-between items-center">
                  <span>Hiệu suất lấp đầy: {percent}%</span>
                  <span>
                    {capacity - occupancy > 0
                      ? `Trống ${capacity - occupancy} khoang`
                      : 'Hết chỗ'}
                  </span>
                </div>
              </div>

              {/* Sub-Header */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Thuyền đang neo đậu ({activeScheduledBoats.length})
                </h4>
                <div className="overflow-y-auto max-h-75 pr-1 space-y-2.5">
                  {activeScheduledBoats.length === 0 ? (
                    <div className="text-center py-10 text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                      Chưa có thuyền nào neo đậu tại bến này.
                    </div>
                  ) : (
                    activeScheduledBoats.map((boat) => (
                      <div
                        key={boat.id}
                        onClick={() => setSelectedBoatDetails(boat)}
                        className="bg-gray-50 hover:bg-gray-100/80 border border-gray-100 hover:border-rose-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                          <Ship className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-800 truncate">
                            {boat.name}
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-bold text-rose-500 bg-rose-500/10 px-1 rounded-sm">
                              Khoang {boat.slotName}
                            </span>
                            <select
                              value={boat.slotName ?? ''}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                void handleAssignBerth(
                                  boat.scheduleId,
                                  e.target.value,
                                );
                              }}
                              className="border border-gray-200 rounded-sm bg-white px-1 text-[10px]"
                              title="Doi khoang neo"
                            >
                              <option value="">- chua gan -</option>
                              {availableBerths.map((code) => (
                                <option key={code} value={code}>
                                  {code}
                                </option>
                              ))}
                            </select>
                            <span>•</span>
                            <span className="truncate">
                              {formatScheduleTime(boat.startTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 text-center">
              Nhấn vào khoang trống trên bản đồ để cấp bến neo đậu
            </div>
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

      {/* Assign Boat Modal */}
      {showAssignModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAssignModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl bg-white border border-gray-100 z-50"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
                    <Plus size={16} className="text-rose-500" />
                  </div>
                  <p className="text-base font-bold text-gray-800">
                    Cấp bến neo đậu - Khoang {assignTargetSlot}
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg p-1.5 hover:bg-black/5 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Chọn thuyền *
                  </label>
                  <select
                    value={assignForm.boatId}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, boatId: e.target.value })
                    }
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-300 bg-white text-gray-800"
                  >
                    <option value="">-- Chọn thuyền trong hệ thống --</option>
                    {allBoats
                      .filter(
                        (boat) => !schedules.some((s) => s.boatId === boat.id),
                      )
                      .map((boat) => (
                        <option key={boat.id} value={boat.id}>
                          {boat.name} ({boat.type || 'Chưa phân loại'})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Thời gian bắt đầu *
                    </label>
                    <input
                      type="datetime-local"
                      value={assignForm.startTime}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-300 text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Thời gian kết thúc *
                    </label>
                    <input
                      type="datetime-local"
                      value={assignForm.endTime}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-gray-300 text-gray-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddSchedule}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all text-white bg-rose-500"
                >
                  Xác nhận cấp bến
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-black/5 transition-all bg-gray-100 text-gray-500"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Boat Detail Modal */}
      {selectedBoatDetails && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedBoatDetails(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-112.5 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col animate-slide-in">
            {/* Header / Thumbnail */}
            <div className="h-56 relative bg-slate-100 shrink-0">
              {selectedBoatDetails.thumbnailUrl ? (
                <img
                  src={selectedBoatDetails.thumbnailUrl}
                  alt={selectedBoatDetails.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-rose-400 to-rose-600">
                  <Ship className="w-16 h-16 text-white opacity-85" />
                </div>
              )}
              <button
                onClick={() => setSelectedBoatDetails(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-white to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${
                    selectedBoatDetails.status === 'running'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {selectedBoatDetails.status === 'running'
                    ? 'HOẠT ĐỘNG'
                    : 'CHỜ / BẢO TRÌ'}
                </span>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedBoatDetails.name}
                </h3>
                <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider mt-0.5">
                  {selectedBoatDetails.type || 'Chưa phân loại'}
                </p>
              </div>

              {/* Schedule Info */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Thông tin neo đậu
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-0.5">
                      Khoang bến
                    </span>
                    <span className="text-gray-800 font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded text-[10px] inline-block">
                      {selectedBoatDetails.slotName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Cầu tàu</span>
                    <span className="text-gray-800 font-semibold text-gray-700">
                      {selectedBoatDetails.pier?.split(' ')[0]}
                    </span>
                  </div>
                  <div className="col-span-2 border-t pt-2 mt-1 border-gray-200/60">
                    <span className="text-gray-400 block mb-1">
                      Thời gian neo đậu
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <Calendar size={12} className="text-gray-400" />
                      <span>
                        {new Date(selectedBoatDetails.startTime).toLocaleString(
                          'vi-VN',
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium mt-1">
                      <Clock size={12} className="text-gray-400" />
                      <span>
                        {new Date(selectedBoatDetails.endTime).toLocaleString(
                          'vi-VN',
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200/80 rounded-xl p-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">
                      Sức chứa khách
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      {selectedBoatDetails.maxPassengers} khách
                    </span>
                  </div>
                </div>
                <div className="border border-gray-200/80 rounded-xl p-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">
                      Số cabin
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      {selectedBoatDetails.cabinCount} cabins
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions: Release schedule */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
              <button
                onClick={() => {
                  if (confirm('Xác nhận giải phóng bến cho tàu này?')) {
                    handleDeleteSchedule(selectedBoatDetails.scheduleId);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all hover:bg-red-650 active:scale-98 text-white bg-red-500 shadow-md shadow-red-500/20"
              >
                <Trash2 size={16} /> Giải phóng bến (Release)
              </button>
            </div>
          </div>
        </>
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
