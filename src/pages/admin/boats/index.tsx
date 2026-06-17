import { useState, useEffect } from 'react';
import {
  Ship,
  Plus,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  Wrench,
  CheckCircle,
  Clock,
  BedDouble,
  Waves,
  ImageIcon,
  Users,
  Save,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  boatApi,
  type BoatDetailResponse,
  type BoatListItemResponse,
  type BoatCabinResponse,
  type BoatServiceResponse,
  type BoatStatsResponse,
} from '@/services/boat-api';

/* ─────────────────────── Design tokens ─────────────────────── */
const ACCENT = '#FF385C';
const ACCENT_BG = 'rgba(255,56,92,0.12)';
const CARD: React.CSSProperties = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
};

/* ─────────────────────── Types ─────────────────────── */
type BoatStatus = 'active' | 'maintenance' | 'idle';
type BoatType = 'cruise' | 'luxury' | 'standard' | 'party' | 'speedboat';

const BOAT_TYPE_LABELS: Record<BoatType, string> = {
  cruise: 'Du thuyền',
  luxury: 'Cao cấp',
  standard: 'Tiêu chuẩn',
  party: 'Thuyền tiệc',
  speedboat: 'Ca nô',
};

/* ─────────────────────── Sub-components ─────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    active: {
      label: 'Hoạt động',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.12)',
      icon: <CheckCircle size={10} />,
    },
    maintenance: {
      label: 'Bảo trì',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      icon: <Wrench size={10} />,
    },
    idle: {
      label: 'Nhàn rỗi',
      color: '#8892a0',
      bg: 'rgba(136,146,160,0.12)',
      icon: <Clock size={10} />,
    },
  }[status as BoatStatus] || {
    label: status,
    color: '#8892a0',
    bg: 'rgba(136,146,160,0.12)',
    icon: <Clock size={10} />,
  };
  return (
    <span
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type?: string }) {
  if (!type) return <span className="text-[10px] text-gray-500">-</span>;
  const label = BOAT_TYPE_LABELS[type as BoatType] || type;
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: ACCENT_BG, color: ACCENT }}
    >
      {label}
    </span>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

/* ═══════════════════ CABIN MANAGEMENT TAB ═══════════════════ */
function CabinTab({
  boat,
  onUpdate,
}: {
  boat: BoatDetailResponse;
  onUpdate: (b: BoatDetailResponse) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    capacity: '',
    price: '',
    totalRooms: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () =>
    setForm({
      name: '',
      capacity: '',
      price: '',
      totalRooms: '',
      description: '',
    });

  const openAdd = () => {
    resetForm();
    setEditId(null);
    setShowForm(true);
  };
  const openEdit = (c: BoatCabinResponse) => {
    setForm({
      name: c.name,
      capacity: String(c.capacity),
      price: String(c.price),
      totalRooms: String(c.totalRooms),
      description: c.description ?? '',
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.capacity || !form.price || !form.totalRooms) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        const res = await boatApi.updateCabin(boat.id, editId, {
          name: form.name,
          capacity: +form.capacity,
          price: +form.price,
          totalRooms: +form.totalRooms,
          description: form.description,
        });
        onUpdate({
          ...boat,
          cabins: boat.cabins.map((c) =>
            c.id === editId ? res.data.result : c,
          ),
        });
        toast.success('Đã cập nhật cabin');
      } else {
        const res = await boatApi.createCabin(boat.id, {
          name: form.name,
          capacity: +form.capacity,
          price: +form.price,
          totalRooms: +form.totalRooms,
          description: form.description,
        });
        onUpdate({ ...boat, cabins: [...boat.cabins, res.data.result] });
        toast.success('Đã thêm cabin mới');
      }
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await boatApi.deleteCabin(boat.id, id);
      onUpdate({ ...boat, cabins: boat.cabins.filter((c) => c.id !== id) });
      toast.success('Đã xóa cabin');
      setConfirmDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#fff' }}>
            Danh sách cabin
          </p>
          <p className="text-xs" style={{ color: '#8892a0' }}>
            {boat.cabins.length} cabin ·{' '}
            {boat.cabins.reduce((s, c) => s + c.totalRooms, 0)} phòng tổng
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={13} /> Thêm cabin
        </button>
      </div>

      {showForm && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            backgroundColor: 'rgba(255,56,92,0.06)',
            border: '1px solid rgba(255,56,92,0.15)',
          }}
        >
          <p className="text-xs font-semibold" style={{ color: ACCENT }}>
            {editId ? 'Chỉnh sửa cabin' : 'Thêm cabin mới'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Tên cabin *',
                key: 'name',
                placeholder: 'VD: VIP Suite',
                span: 2,
              },
              {
                label: 'Sức chứa (người) *',
                key: 'capacity',
                placeholder: '4',
              },
              { label: 'Số phòng *', key: 'totalRooms', placeholder: '2' },
              {
                label: 'Giá/đêm (₫) *',
                key: 'price',
                placeholder: '2500000',
                span: 2,
              },
              {
                label: 'Mô tả',
                key: 'description',
                placeholder: 'Mô tả cabin...',
                span: 2,
              },
            ].map(({ label, key, placeholder, span }) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label
                  className="block text-[10px] font-semibold mb-1"
                  style={{ color: '#8892a0' }}
                >
                  {label}
                </label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  disabled={loading}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              {loading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{' '}
              Lưu
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-xs font-semibold hover:bg-white/5 disabled:opacity-50"
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

      {confirmDelete && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <AlertTriangle
            size={16}
            style={{ color: '#EF4444', flexShrink: 0 }}
          />
          <p className="text-xs flex-1" style={{ color: '#c8d0e0' }}>
            Bạn chắc chắn muốn xoá cabin này?
          </p>
          <button
            onClick={() => handleDelete(confirmDelete)}
            disabled={loading}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#EF4444', color: '#fff' }}
          >
            {loading ? 'Đang xoá...' : 'Xoá'}
          </button>
          <button
            onClick={() => setConfirmDelete(null)}
            disabled={loading}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#c8d0e0',
            }}
          >
            Hủy
          </button>
        </div>
      )}

      {boat.cabins.length === 0 ? (
        <div
          className="rounded-xl py-10 text-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          <BedDouble
            size={28}
            className="mx-auto mb-2"
            style={{ color: '#8892a0' }}
          />
          <p className="text-sm" style={{ color: '#8892a0' }}>
            Chưa có cabin nào
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {boat.cabins.map((cabin) => (
            <div
              key={cabin.id}
              className="rounded-xl p-4 flex items-center gap-4 group transition-all hover:scale-[1.005]"
              style={CARD}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}
              >
                <BedDouble size={16} style={{ color: '#3B82F6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                  {cabin.name}
                </p>
                <p className="text-xs" style={{ color: '#8892a0' }}>
                  {cabin.totalRooms} phòng · {cabin.capacity} người/phòng
                </p>
                {cabin.description && (
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: '#8892a0' }}
                  >
                    {cabin.description}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold" style={{ color: ACCENT }}>
                  ₫{fmt(cabin.price)}
                </p>
                <p className="text-[10px]" style={{ color: '#8892a0' }}>
                  / đêm
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cabin)}
                  disabled={loading}
                  className="rounded-lg p-1.5 hover:bg-white/10 disabled:opacity-50"
                  style={{ color: '#c8d0e0' }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setConfirmDelete(cabin.id)}
                  disabled={loading}
                  className="rounded-lg p-1.5 hover:bg-red-500/10 disabled:opacity-50"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ SERVICE MANAGEMENT TAB ═══════════════════ */
function ServiceTab({
  boat,
  onUpdate,
}: {
  boat: BoatDetailResponse;
  onUpdate: (b: BoatDetailResponse) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () =>
    setForm({ name: '', price: '', description: '', isActive: true });

  const openAdd = () => {
    resetForm();
    setEditId(null);
    setShowForm(true);
  };
  const openEdit = (s: BoatServiceResponse) => {
    setForm({
      name: s.name,
      price: String(s.price),
      description: s.description ?? '',
      isActive: s.isActive,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Tên dịch vụ là bắt buộc');
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        const res = await boatApi.updateService(boat.id, editId, {
          name: form.name,
          price: +form.price || 0,
          description: form.description,
          isActive: form.isActive,
        });
        onUpdate({
          ...boat,
          services: boat.services.map((s) =>
            s.id === editId ? res.data.result : s,
          ),
        });
        toast.success('Đã cập nhật dịch vụ');
      } else {
        const res = await boatApi.createService(boat.id, {
          name: form.name,
          price: +form.price || 0,
          description: form.description,
          isActive: form.isActive,
        });
        onUpdate({ ...boat, services: [...boat.services, res.data.result] });
        toast.success('Đã thêm dịch vụ mới');
      }
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const res = await boatApi.toggleService(boat.id, id);
      onUpdate({
        ...boat,
        services: boat.services.map((s) => (s.id === id ? res.data.result : s)),
      });
      toast.success(
        res.data.result.isActive
          ? 'Đã kích hoạt dịch vụ'
          : 'Đã tạm dừng dịch vụ',
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await boatApi.deleteService(boat.id, id);
      onUpdate({ ...boat, services: boat.services.filter((s) => s.id !== id) });
      toast.success('Đã xóa dịch vụ');
      setConfirmDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#fff' }}>
            Dịch vụ trên thuyền
          </p>
          <p className="text-xs" style={{ color: '#8892a0' }}>
            {boat.services.filter((s) => s.isActive).length}/
            {boat.services.length} dịch vụ đang hoạt động
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={13} /> Thêm dịch vụ
        </button>
      </div>

      {showForm && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            backgroundColor: 'rgba(255,56,92,0.06)',
            border: '1px solid rgba(255,56,92,0.15)',
          }}
        >
          <p className="text-xs font-semibold" style={{ color: ACCENT }}>
            {editId ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Tên dịch vụ *',
                key: 'name',
                placeholder: 'VD: Buffet hải sản',
                span: 2,
              },
              {
                label: 'Giá (₫)',
                key: 'price',
                placeholder: '0 nếu miễn phí',
                span: 2,
              },
              {
                label: 'Mô tả',
                key: 'description',
                placeholder: 'Mô tả dịch vụ...',
                span: 2,
              },
            ].map(({ label, key, placeholder, span }) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label
                  className="block text-[10px] font-semibold mb-1"
                  style={{ color: '#8892a0' }}
                >
                  {label}
                </label>
                <input
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  disabled={loading}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
              </div>
            ))}
            <div className="col-span-2 flex items-center gap-3">
              <label
                className="text-[10px] font-semibold"
                style={{ color: '#8892a0' }}
              >
                Trạng thái
              </label>
              <button
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
                style={{ color: form.isActive ? '#10B981' : '#8892a0' }}
              >
                {form.isActive ? (
                  <ToggleRight size={20} />
                ) : (
                  <ToggleLeft size={20} />
                )}
                {form.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              {loading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{' '}
              Lưu
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-xs font-semibold hover:bg-white/5 disabled:opacity-50"
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

      {confirmDelete && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <AlertTriangle
            size={16}
            style={{ color: '#EF4444', flexShrink: 0 }}
          />
          <p className="text-xs flex-1" style={{ color: '#c8d0e0' }}>
            Bạn chắc chắn muốn xoá dịch vụ này?
          </p>
          <button
            onClick={() => handleDelete(confirmDelete)}
            disabled={loading}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#EF4444', color: '#fff' }}
          >
            {loading ? 'Đang xoá...' : 'Xoá'}
          </button>
          <button
            onClick={() => setConfirmDelete(null)}
            disabled={loading}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#c8d0e0',
            }}
          >
            Hủy
          </button>
        </div>
      )}

      {boat.services.length === 0 ? (
        <div
          className="rounded-xl py-10 text-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          <Waves
            size={28}
            className="mx-auto mb-2"
            style={{ color: '#8892a0' }}
          />
          <p className="text-sm" style={{ color: '#8892a0' }}>
            Chưa có dịch vụ nào
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {boat.services.map((svc) => (
            <div
              key={svc.id}
              className="rounded-xl p-4 flex items-center gap-4 group transition-all hover:scale-[1.005]"
              style={CARD}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: svc.isActive
                    ? 'rgba(16,185,129,0.12)'
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                <Waves
                  size={16}
                  style={{ color: svc.isActive ? '#10B981' : '#8892a0' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: '#fff' }}
                  >
                    {svc.name}
                  </p>
                  {!svc.isActive && (
                    <span
                      className="text-[10px] rounded-md px-1.5 py-0.5 font-semibold"
                      style={{
                        backgroundColor: 'rgba(136,146,160,0.12)',
                        color: '#8892a0',
                      }}
                    >
                      Tạm dừng
                    </span>
                  )}
                </div>
                {svc.description && (
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: '#8892a0' }}
                  >
                    {svc.description}
                  </p>
                )}
              </div>
              <p
                className="text-sm font-bold shrink-0"
                style={{ color: svc.price === 0 ? '#10B981' : '#fff' }}
              >
                {svc.price === 0 ? 'Miễn phí' : `₫${fmt(svc.price)}`}
              </p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleActive(svc.id)}
                  disabled={loading}
                  className="rounded-lg p-1.5 hover:bg-white/10 disabled:opacity-50"
                  style={{ color: svc.isActive ? '#F59E0B' : '#10B981' }}
                  title={svc.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                >
                  {svc.isActive ? (
                    <ToggleRight size={15} />
                  ) : (
                    <ToggleLeft size={15} />
                  )}
                </button>
                <button
                  onClick={() => openEdit(svc)}
                  disabled={loading}
                  className="rounded-lg p-1.5 hover:bg-white/10 disabled:opacity-50"
                  style={{ color: '#c8d0e0' }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setConfirmDelete(svc.id)}
                  disabled={loading}
                  className="rounded-lg p-1.5 hover:bg-red-500/10 disabled:opacity-50"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ IMAGES MANAGEMENT TAB ═══════════════════ */
function ImagesTab({
  boat,
  onUpdate,
}: {
  boat: BoatDetailResponse;
  onUpdate: (b: BoatDetailResponse) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setLoading(true);
      try {
        const res = await boatApi.uploadImage(boat.id, { fileBase64: base64 });
        onUpdate({ ...boat, images: [...boat.images, res.data.result] });
        toast.success('Đã tải ảnh lên thành công');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi khi tải ảnh lên');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;
    setLoading(true);
    try {
      await boatApi.deleteImage(boat.id, id);
      onUpdate({ ...boat, images: boat.images.filter((i) => i.id !== id) });
      toast.success('Đã xóa ảnh');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#fff' }}>
            Hình ảnh thuyền
          </p>
          <p className="text-xs" style={{ color: '#8892a0' }}>
            {boat.images.length} ảnh
          </p>
        </div>
        <label
          className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-90 active:scale-95 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Plus size={13} />
          )}{' '}
          Tải ảnh lên
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={loading}
          />
        </label>
      </div>

      {boat.images.length === 0 ? (
        <div
          className="rounded-xl py-10 text-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          <ImageIcon
            size={28}
            className="mx-auto mb-2"
            style={{ color: '#8892a0' }}
          />
          <p className="text-sm" style={{ color: '#8892a0' }}>
            Chưa có hình ảnh
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {boat.images.map((img) => (
            <div
              key={img.id}
              className="relative rounded-xl overflow-hidden group"
              style={CARD}
            >
              <img
                src={img.imageUrl}
                alt={img.caption || 'Boat image'}
                className="w-full aspect-video object-cover"
              />
              <button
                onClick={() => handleDelete(img.id)}
                disabled={loading}
                className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ BOAT DETAIL DRAWER ═══════════════════ */
type DrawerTab = 'info' | 'cabins' | 'services' | 'images';

function BoatDetailDrawer({
  boatId,
  onClose,
  onRefresh,
}: {
  boatId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('info');
  const [editMode, setEditMode] = useState(false);
  const [boat, setBoat] = useState<BoatDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form for info tab
  const [form, setForm] = useState({
    name: '',
    type: '',
    maxPassengers: '',
    status: '',
  });

  useEffect(() => {
    loadBoat();
  }, [boatId]);

  const loadBoat = async () => {
    try {
      setLoading(true);
      const res = await boatApi.getById(boatId);
      setBoat(res.data.result);
      setForm({
        name: res.data.result.name,
        type: res.data.result.type || 'cruise',
        maxPassengers: String(res.data.result.maxPassengers),
        status: res.data.result.status,
      });
    } catch (error) {
      toast.error('Không thể tải thông tin thuyền');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBoat = (updated: BoatDetailResponse) => {
    setBoat(updated);
    onRefresh(); // Refresh list in background
  };

  const handleSaveInfo = async () => {
    if (!form.name || !form.maxPassengers) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    setSaving(true);
    try {
      const res = await boatApi.update(boatId, {
        name: form.name,
        type: form.type,
        maxPassengers: +form.maxPassengers,
        status: form.status,
      });
      setBoat(res.data.result);
      setEditMode(false);
      onRefresh();
      toast.success('Cập nhật thông tin thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !boat) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl items-center justify-center shadow-2xl"
          style={{
            backgroundColor: '#0a0f1e',
            borderLeft: '1px solid rgba(255,56,92,0.12)',
          }}
        >
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  const tabs: { id: DrawerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Thông tin', icon: <Ship size={14} /> },
    {
      id: 'cabins',
      label: `Cabin (${boat.cabins.length})`,
      icon: <BedDouble size={14} />,
    },
    {
      id: 'services',
      label: `Dịch vụ (${boat.services.length})`,
      icon: <Waves size={14} />,
    },
    {
      id: 'images',
      label: `Hình ảnh (${boat.images.length})`,
      icon: <ImageIcon size={14} />,
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col shadow-2xl overflow-hidden"
        style={{
          backgroundColor: '#0a0f1e',
          borderLeft: '1px solid rgba(255,56,92,0.12)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: ACCENT_BG }}
            >
              <Ship size={18} style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>
                {boat.name}
              </p>
              <p className="text-[10px]" style={{ color: '#8892a0' }}>
                ID: {boat.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={boat.status} />
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-white/10"
              style={{ color: '#8892a0' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-xs font-semibold transition-colors"
              style={{
                color: activeTab === t.id ? ACCENT : '#8892a0',
                borderBottom:
                  activeTab === t.id
                    ? `2px solid ${ACCENT}`
                    : '2px solid transparent',
                backgroundColor: activeTab === t.id ? ACCENT_BG : 'transparent',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {editMode ? (
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{
                    backgroundColor: 'rgba(255,56,92,0.06)',
                    border: '1px solid rgba(255,56,92,0.15)',
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: ACCENT }}
                  >
                    Chỉnh sửa thông tin
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label
                        className="block text-[10px] font-semibold mb-1"
                        style={{ color: '#8892a0' }}
                      >
                        Tên thuyền
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                        disabled={saving}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[10px] font-semibold mb-1"
                        style={{ color: '#8892a0' }}
                      >
                        Sức chứa tối đa
                      </label>
                      <input
                        value={form.maxPassengers}
                        onChange={(e) =>
                          setForm({ ...form, maxPassengers: e.target.value })
                        }
                        className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                        disabled={saving}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[10px] font-semibold mb-1"
                        style={{ color: '#8892a0' }}
                      >
                        Loại thuyền
                      </label>
                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm({ ...form, type: e.target.value })
                        }
                        className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                        disabled={saving}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      >
                        {Object.entries(BOAT_TYPE_LABELS).map(([v, l]) => (
                          <option
                            key={v}
                            value={v}
                            style={{ backgroundColor: '#0d1629' }}
                          >
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label
                        className="block text-[10px] font-semibold mb-1"
                        style={{ color: '#8892a0' }}
                      >
                        Trạng thái
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                        className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                        disabled={saving}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      >
                        <option
                          value="active"
                          style={{ backgroundColor: '#0d1629' }}
                        >
                          Hoạt động
                        </option>
                        <option
                          value="maintenance"
                          style={{ backgroundColor: '#0d1629' }}
                        >
                          Bảo trì
                        </option>
                        <option
                          value="idle"
                          style={{ backgroundColor: '#0d1629' }}
                        >
                          Nhàn rỗi
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveInfo}
                      disabled={saving}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: ACCENT, color: '#fff' }}
                    >
                      {saving ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}{' '}
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      disabled={saving}
                      className="rounded-lg px-4 py-2 text-xs font-semibold hover:bg-white/5 disabled:opacity-50"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: '#c8d0e0',
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden" style={CARD}>
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: '#fff' }}
                    >
                      Thông tin chi tiết
                    </p>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-1 text-xs font-semibold hover:opacity-80"
                      style={{ color: ACCENT }}
                    >
                      <Edit2 size={11} /> Chỉnh sửa
                    </button>
                  </div>
                  {[
                    {
                      label: 'Loại thuyền',
                      value:
                        BOAT_TYPE_LABELS[boat.type as BoatType] ||
                        boat.type ||
                        '-',
                    },
                    {
                      label: 'Sức chứa tối đa',
                      value: `${boat.maxPassengers} khách`,
                    },
                    {
                      label: 'Ngày tạo',
                      value: new Date(boat.createdAt).toLocaleDateString(
                        'vi-VN',
                      ),
                    },
                    {
                      label: 'Cập nhật lần cuối',
                      value: new Date(boat.updatedAt).toLocaleDateString(
                        'vi-VN',
                      ),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-4 py-2.5 border-b last:border-0"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <span className="text-xs" style={{ color: '#8892a0' }}>
                        {label}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: '#fff' }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cabins' && (
            <CabinTab boat={boat} onUpdate={handleUpdateBoat} />
          )}
          {activeTab === 'services' && (
            <ServiceTab boat={boat} onUpdate={handleUpdateBoat} />
          )}
          {activeTab === 'images' && (
            <ImagesTab boat={boat} onUpdate={handleUpdateBoat} />
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════ ADD BOAT MODAL ═══════════════════ */
function BoatFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    type: 'cruise',
    maxPassengers: '',
    status: 'idle',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.maxPassengers) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    setLoading(true);
    try {
      await boatApi.create({
        name: form.name,
        type: form.type,
        maxPassengers: +form.maxPassengers,
        status: form.status,
      });
      toast.success('Đã tạo thuyền mới');
      onSave();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-md rounded-2xl p-6 space-y-5 pointer-events-auto shadow-2xl"
          style={{
            backgroundColor: '#0a0f1e',
            border: '1px solid rgba(255,56,92,0.2)',
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-base font-bold" style={{ color: '#fff' }}>
              Thêm thuyền mới
            </p>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-white/10"
              style={{ color: '#8892a0' }}
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label
                className="block text-[11px] font-semibold mb-1.5"
                style={{ color: '#8892a0' }}
              >
                Tên thuyền *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Rồng Vàng"
                disabled={loading}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              />
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold mb-1.5"
                style={{ color: '#8892a0' }}
              >
                Sức chứa tối đa *
              </label>
              <input
                value={form.maxPassengers}
                onChange={(e) =>
                  setForm({ ...form, maxPassengers: e.target.value })
                }
                placeholder="40"
                type="number"
                disabled={loading}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-[11px] font-semibold mb-1.5"
                  style={{ color: '#8892a0' }}
                >
                  Loại thuyền
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  disabled={loading}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                >
                  {Object.entries(BOAT_TYPE_LABELS).map(([v, l]) => (
                    <option
                      key={v}
                      value={v}
                      style={{ backgroundColor: '#0a0f1e' }}
                    >
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-[11px] font-semibold mb-1.5"
                  style={{ color: '#8892a0' }}
                >
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  disabled={loading}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                >
                  <option value="active" style={{ backgroundColor: '#0a0f1e' }}>
                    Hoạt động
                  </option>
                  <option
                    value="maintenance"
                    style={{ backgroundColor: '#0a0f1e' }}
                  >
                    Bảo trì
                  </option>
                  <option value="idle" style={{ backgroundColor: '#0a0f1e' }}>
                    Nhàn rỗi
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}{' '}
              Tạo thuyền
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-white/5 transition-all disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#c8d0e0',
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function AdminBoats() {
  const [boats, setBoats] = useState<BoatListItemResponse[]>([]);
  const [stats, setStats] = useState<BoatStatsResponse>({
    total: 0,
    active: 0,
    maintenance: 0,
    idle: 0,
  });

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [selectedBoatId, setSelectedBoatId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchBoats();
  }, [page, search, filterStatus, filterType]);

  const fetchStats = async () => {
    try {
      const res = await boatApi.getStats();
      setStats(res.data.result);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBoats = async () => {
    setLoading(true);
    try {
      const query: any = { page, pageSize: 10 };
      if (search) query.search = search;
      if (filterStatus !== 'all') query.status = filterStatus;
      if (filterType !== 'all') query.type = filterType;

      const res = await boatApi.getBoats(query);
      setBoats(res.data.result.items);
      setTotalPages(res.data.result.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách thuyền');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchBoats();
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await boatApi.delete(id);
      toast.success('Đã xóa thuyền');
      setConfirmDelete(null);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const KPI_STATS = [
    {
      label: 'Tổng thuyền',
      value: stats.total,
      icon: <Ship size={18} />,
      color: ACCENT,
      bg: ACCENT_BG,
    },
    {
      label: 'Đang hoạt động',
      value: stats.active,
      icon: <CheckCircle size={18} />,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.12)',
    },
    {
      label: 'Đang bảo trì',
      value: stats.maintenance,
      icon: <Wrench size={18} />,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
    },
    {
      label: 'Nhàn rỗi',
      value: stats.idle,
      icon: <Clock size={18} />,
      color: '#8892a0',
      bg: 'rgba(136,146,160,0.12)',
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            Quản lý Thuyền
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
            Hệ thống quản lý đội tàu, cabin và dịch vụ
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={16} /> Thêm thuyền
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={CARD}
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: s.bg }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold" style={{ color: '#fff' }}>
              {s.value}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: '#8892a0' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#8892a0' }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm theo tên thuyền..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            }}
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#8892a0' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:bg-white/5"
          style={{
            backgroundColor: showFilters ? ACCENT_BG : 'rgba(255,255,255,0.05)',
            color: showFilters ? ACCENT : '#c8d0e0',
            border:
              '1px solid ' +
              (showFilters ? 'rgba(255,56,92,0.2)' : 'rgba(255,255,255,0.1)'),
          }}
        >
          <Filter size={14} /> Lọc{' '}
          <ChevronDown
            size={14}
            className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {showFilters && (
        <div
          className="flex flex-wrap gap-3 rounded-xl p-4"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold"
              style={{ color: '#8892a0' }}
            >
              Trạng thái:
            </span>
            {(['all', 'active', 'maintenance', 'idle'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilterStatus(s);
                  setPage(1);
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                style={{
                  backgroundColor:
                    filterStatus === s ? ACCENT_BG : 'rgba(255,255,255,0.05)',
                  color: filterStatus === s ? ACCENT : '#c8d0e0',
                  border:
                    filterStatus === s
                      ? '1px solid rgba(255,56,92,0.3)'
                      : '1px solid transparent',
                }}
              >
                {s === 'all'
                  ? 'Tất cả'
                  : s === 'active'
                    ? 'Hoạt động'
                    : s === 'maintenance'
                      ? 'Bảo trì'
                      : 'Nhàn rỗi'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold"
              style={{ color: '#8892a0' }}
            >
              Loại:
            </span>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg px-3 py-1.5 text-xs outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#c8d0e0',
              }}
            >
              <option value="all" style={{ backgroundColor: '#0d1629' }}>
                Tất cả loại
              </option>
              {Object.entries(BOAT_TYPE_LABELS).map(([v, l]) => (
                <option
                  key={v}
                  value={v}
                  style={{ backgroundColor: '#0d1629' }}
                >
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl" style={CARD}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 700 }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <tr className="text-left">
                {[
                  'Thuyền',
                  'Loại',
                  'Sức chứa',
                  'Cabin/DV',
                  'Trạng thái',
                  'Thao tác',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: '#8892a0' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              {loading && boats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-gray-500"
                    />
                  </td>
                </tr>
              ) : boats.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-sm"
                    style={{ color: '#8892a0' }}
                  >
                    Không tìm thấy thuyền nào
                  </td>
                </tr>
              ) : (
                boats.map((boat) => (
                  <tr
                    key={boat.id}
                    className="group transition-colors hover:bg-white/2"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-gray-800">
                          {boat.thumbnailUrl ? (
                            <img
                              src={boat.thumbnailUrl}
                              alt={boat.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Ship size={16} style={{ color: '#8892a0' }} />
                          )}
                        </div>
                        <div>
                          <p
                            className="font-semibold text-xs"
                            style={{ color: '#fff' }}
                          >
                            {boat.name}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: '#8892a0' }}
                          >
                            ID: {boat.id.split('-')[0]}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={boat.type} />
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: '#c8d0e0' }}
                    >
                      <div className="flex items-center gap-1">
                        <Users size={11} style={{ color: '#8892a0' }} />
                        {boat.maxPassengers}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: '#c8d0e0' }}
                    >
                      <span>
                        <BedDouble
                          size={10}
                          className="inline mr-0.5"
                          style={{ color: '#8892a0' }}
                        />
                        {boat.cabinCount}
                      </span>
                      <span className="mx-1.5" style={{ color: '#8892a0' }}>
                        ·
                      </span>
                      <span>
                        <Waves
                          size={10}
                          className="inline mr-0.5"
                          style={{ color: '#8892a0' }}
                        />
                        {boat.serviceCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={boat.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedBoatId(boat.id)}
                          className="rounded-lg p-1.5 hover:bg-white/10"
                          style={{ color: '#3B82F6' }}
                          title="Xem chi tiết & Chỉnh sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(boat.id)}
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
        {/* Pagination placeholder */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between border-t px-6 py-3"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs text-gray-400 hover:text-white disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-xs text-gray-500">
              Trang {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs text-gray-400 hover:text-white disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setConfirmDelete(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              backgroundColor: '#0a0f1e',
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
                <p className="font-semibold text-sm" style={{ color: '#fff' }}>
                  Xác nhận xoá thuyền
                </p>
                <p className="text-xs" style={{ color: '#8892a0' }}>
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={loading}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#EF4444', color: '#fff' }}
              >
                {loading ? 'Đang xoá...' : 'Xoá thuyền'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={loading}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#c8d0e0',
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedBoatId && (
        <BoatDetailDrawer
          boatId={selectedBoatId}
          onClose={() => setSelectedBoatId(null)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Add Modal */}
      {showAddForm && (
        <BoatFormModal
          onClose={() => setShowAddForm(false)}
          onSave={() => {
            setShowAddForm(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
