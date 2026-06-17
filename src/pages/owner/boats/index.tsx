import { useState, useMemo } from 'react';
import {
  Ship,
  Plus,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  Wrench,
  CheckCircle,
  Clock,
  BedDouble,
  Waves,
  ArrowUpRight,
  ArrowDownRight,
  ImageIcon,
  DollarSign,
  Users,
  Anchor,
  Save,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

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

interface BoatCabin {
  id: string;
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
}

interface BoatService {
  id: string;
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
}

interface BoatImage {
  id: string;
  imageUrl: string;
  caption?: string;
}

interface Boat {
  id: string;
  name: string;
  type: BoatType;
  owner: string;
  maxPassengers: number;
  status: BoatStatus;
  dock: string;
  maintenanceUntil?: string;
  totalBookings: number;
  revenue: number;
  createdAt: string;
  cabins: BoatCabin[];
  services: BoatService[];
  images: BoatImage[];
}

/* ─────────────────────── Mock data ─────────────────────── */
const MOCK_BOATS: Boat[] = [
  {
    id: 'boat-1',
    name: 'Rồng Vàng',
    type: 'cruise',
    owner: 'Du thuyền Hoàng Gia',
    maxPassengers: 40,
    status: 'active',
    dock: 'Bến Tuần Châu',
    totalBookings: 128,
    revenue: 245000000,
    createdAt: '2024-01-15',
    cabins: [
      {
        id: 'c1',
        name: 'VIP Suite',
        capacity: 4,
        price: 2500000,
        totalRooms: 2,
        description: 'Phòng VIP view sông Hàn',
      },
      {
        id: 'c2',
        name: 'Deluxe Double',
        capacity: 2,
        price: 1500000,
        totalRooms: 5,
        description: 'Phòng đôi tiện nghi',
      },
      {
        id: 'c3',
        name: 'Standard Twin',
        capacity: 2,
        price: 900000,
        totalRooms: 8,
      },
    ],
    services: [
      {
        id: 's1',
        name: 'Buffet Hải sản',
        price: 450000,
        description: 'Thực đơn hải sản tươi sống',
        isActive: true,
      },
      {
        id: 's2',
        name: 'Nước uống miễn phí',
        price: 0,
        description: 'Nước suối, trà',
        isActive: true,
      },
      { id: 's3', name: 'DJ & Âm nhạc', price: 200000, isActive: true },
      {
        id: 's4',
        name: 'Nhiếp ảnh gia',
        price: 350000,
        description: 'Chụp ảnh chuyên nghiệp',
        isActive: false,
      },
    ],
    images: [
      {
        id: 'i1',
        imageUrl:
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
        caption: 'Tổng quan',
      },
      {
        id: 'i2',
        imageUrl:
          'https://images.unsplash.com/photo-1559599746-8823b38544c6?w=600&h=400&fit=crop',
        caption: 'Khu VIP',
      },
    ],
  },
  {
    id: 'boat-2',
    name: 'Ngọc Trai',
    type: 'luxury',
    owner: 'Du thuyền Hoàng Gia',
    maxPassengers: 20,
    status: 'maintenance',
    dock: 'Bến Cát Bà',
    maintenanceUntil: '30/05/2026',
    totalBookings: 87,
    revenue: 156000000,
    createdAt: '2024-03-20',
    cabins: [
      {
        id: 'c4',
        name: 'Royal Suite',
        capacity: 2,
        price: 5000000,
        totalRooms: 2,
        description: 'Phòng hoàng gia với bồn tắm',
      },
      { id: 'c5', name: 'Premium', capacity: 2, price: 3000000, totalRooms: 4 },
    ],
    services: [
      {
        id: 's5',
        name: 'Fine Dining',
        price: 1200000,
        description: 'Set menu 5 món Pháp',
        isActive: true,
      },
      { id: 's6', name: 'Rượu vang', price: 800000, isActive: true },
      { id: 's7', name: 'Spa trên thuyền', price: 600000, isActive: false },
    ],
    images: [
      {
        id: 'i3',
        imageUrl:
          'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600&h=400&fit=crop',
        caption: 'Tổng quan',
      },
    ],
  },
  {
    id: 'boat-3',
    name: 'Sóng Xanh',
    type: 'standard',
    owner: 'HTX Tàu biển Cần Giờ',
    maxPassengers: 30,
    status: 'active',
    dock: 'Bến Bạch Đằng',
    totalBookings: 210,
    revenue: 189000000,
    createdAt: '2023-11-10',
    cabins: [
      {
        id: 'c6',
        name: 'Cabin Đôi',
        capacity: 2,
        price: 800000,
        totalRooms: 6,
      },
      {
        id: 'c7',
        name: 'Cabin Gia đình',
        capacity: 4,
        price: 1200000,
        totalRooms: 3,
        description: 'Phù hợp gia đình nhỏ',
      },
    ],
    services: [
      { id: 's8', name: 'Đồ ăn nhẹ', price: 150000, isActive: true },
      { id: 's9', name: 'Hướng dẫn viên', price: 200000, isActive: true },
    ],
    images: [
      {
        id: 'i4',
        imageUrl:
          'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=600&h=400&fit=crop',
        caption: 'Bên ngoài',
      },
    ],
  },
  {
    id: 'boat-4',
    name: 'Rồng Vàng II',
    type: 'party',
    owner: 'TNHH Biển Xanh',
    maxPassengers: 50,
    status: 'active',
    dock: 'Bến Tuần Châu',
    totalBookings: 95,
    revenue: 320000000,
    createdAt: '2023-07-20',
    cabins: [],
    services: [
      { id: 's10', name: 'DJ Set', price: 500000, isActive: true },
      { id: 's11', name: 'LED Show', price: 300000, isActive: true },
      {
        id: 's12',
        name: 'Cocktail Bar',
        price: 250000,
        description: 'Quầy bar cocktail',
        isActive: true,
      },
    ],
    images: [
      {
        id: 'i5',
        imageUrl:
          'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=600&h=400&fit=crop',
        caption: 'Party deck',
      },
    ],
  },
  {
    id: 'boat-5',
    name: 'Hải Âu',
    type: 'speedboat',
    owner: 'Du thuyền Phúc Hải',
    maxPassengers: 12,
    status: 'idle',
    dock: 'Bến Nha Trang',
    totalBookings: 63,
    revenue: 78000000,
    createdAt: '2024-09-05',
    cabins: [],
    services: [
      { id: 's13', name: 'Áo phao chuyên dụng', price: 0, isActive: true },
    ],
    images: [
      {
        id: 'i6',
        imageUrl:
          'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&h=400&fit=crop',
        caption: 'Ca nô',
      },
    ],
  },
  {
    id: 'boat-6',
    name: 'Cá Chép Đỏ',
    type: 'standard',
    owner: 'Tàu du lịch Mekong',
    maxPassengers: 25,
    status: 'idle',
    dock: 'Bến Cần Thơ',
    totalBookings: 156,
    revenue: 112000000,
    createdAt: '2023-07-20',
    cabins: [
      {
        id: 'c8',
        name: 'Cabin Đơn',
        capacity: 1,
        price: 500000,
        totalRooms: 4,
      },
      {
        id: 'c9',
        name: 'Cabin Đôi',
        capacity: 2,
        price: 750000,
        totalRooms: 5,
      },
    ],
    services: [
      { id: 's14', name: 'Nước giải khát', price: 50000, isActive: true },
    ],
    images: [],
  },
];

const BOAT_TYPE_LABELS: Record<BoatType, string> = {
  cruise: 'Du thuyền',
  luxury: 'Cao cấp',
  standard: 'Tiêu chuẩn',
  party: 'Thuyền tiệc',
  speedboat: 'Ca nô',
};

const DOCKS = [
  'Bến Tuần Châu',
  'Bến Cát Bà',
  'Bến Bạch Đằng',
  'Bến Nha Trang',
  'Bến Cần Thơ',
  'Bến Phú Quốc',
];

/* ─────────────────────── Sub-components ─────────────────────── */

function StatusBadge({ status }: { status: BoatStatus }) {
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
  }[status];
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

function TypeBadge({ type }: { type: BoatType }) {
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: ACCENT_BG, color: ACCENT }}
    >
      {BOAT_TYPE_LABELS[type]}
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
  boat: Boat;
  onUpdate: (b: Boat) => void;
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
  const openEdit = (c: BoatCabin) => {
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

  const handleSave = () => {
    if (!form.name || !form.capacity || !form.price || !form.totalRooms) return;
    if (editId) {
      onUpdate({
        ...boat,
        cabins: boat.cabins.map((c) =>
          c.id === editId
            ? {
                ...c,
                ...form,
                capacity: +form.capacity,
                price: +form.price,
                totalRooms: +form.totalRooms,
              }
            : c,
        ),
      });
    } else {
      const newCabin: BoatCabin = {
        id: `c-${Date.now()}`,
        name: form.name,
        capacity: +form.capacity,
        price: +form.price,
        totalRooms: +form.totalRooms,
        description: form.description || undefined,
      };
      onUpdate({ ...boat, cabins: [...boat.cabins, newCabin] });
    }
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    onUpdate({ ...boat, cabins: boat.cabins.filter((c) => c.id !== id) });
    setConfirmDelete(null);
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
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={13} /> Thêm cabin
        </button>
      </div>

      {/* Form */}
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
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
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
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              <Save size={12} /> Lưu
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-lg px-4 py-2 text-xs font-semibold hover:bg-white/5"
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

      {/* Confirm delete */}
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
            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: '#EF4444', color: '#fff' }}
          >
            Xoá
          </button>
          <button
            onClick={() => setConfirmDelete(null)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#c8d0e0',
            }}
          >
            Hủy
          </button>
        </div>
      )}

      {/* Cabin list */}
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
                  className="rounded-lg p-1.5 hover:bg-white/10"
                  style={{ color: '#c8d0e0' }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setConfirmDelete(cabin.id)}
                  className="rounded-lg p-1.5 hover:bg-red-500/10"
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
  boat: Boat;
  onUpdate: (b: Boat) => void;
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

  const resetForm = () =>
    setForm({ name: '', price: '', description: '', isActive: true });

  const openAdd = () => {
    resetForm();
    setEditId(null);
    setShowForm(true);
  };
  const openEdit = (s: BoatService) => {
    setForm({
      name: s.name,
      price: String(s.price),
      description: s.description ?? '',
      isActive: s.isActive,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editId) {
      onUpdate({
        ...boat,
        services: boat.services.map((s) =>
          s.id === editId ? { ...s, ...form, price: +form.price } : s,
        ),
      });
    } else {
      const newSvc: BoatService = {
        id: `s-${Date.now()}`,
        name: form.name,
        price: +form.price,
        description: form.description || undefined,
        isActive: form.isActive,
      };
      onUpdate({ ...boat, services: [...boat.services, newSvc] });
    }
    setShowForm(false);
    resetForm();
  };

  const toggleActive = (id: string) => {
    onUpdate({
      ...boat,
      services: boat.services.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s,
      ),
    });
  };

  const handleDelete = (id: string) => {
    onUpdate({ ...boat, services: boat.services.filter((s) => s.id !== id) });
    setConfirmDelete(null);
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
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
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
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
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
                className="flex items-center gap-1.5 text-xs font-semibold"
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
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              <Save size={12} /> Lưu
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-lg px-4 py-2 text-xs font-semibold hover:bg-white/5"
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
            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: '#EF4444', color: '#fff' }}
          >
            Xoá
          </button>
          <button
            onClick={() => setConfirmDelete(null)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
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
                  className="rounded-lg p-1.5 hover:bg-white/10"
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
                  className="rounded-lg p-1.5 hover:bg-white/10"
                  style={{ color: '#c8d0e0' }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setConfirmDelete(svc.id)}
                  className="rounded-lg p-1.5 hover:bg-red-500/10"
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

/* ═══════════════════ BOAT DETAIL DRAWER ═══════════════════ */
type DrawerTab = 'info' | 'cabins' | 'services' | 'images';

function BoatDetailDrawer({
  boat,
  onClose,
  onUpdate,
}: {
  boat: Boat;
  onClose: () => void;
  onUpdate: (b: Boat) => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('info');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: boat.name,
    type: boat.type,
    owner: boat.owner,
    maxPassengers: String(boat.maxPassengers),
    status: boat.status,
    dock: boat.dock,
  });

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

  const handleSaveInfo = () => {
    onUpdate({ ...boat, ...form, maxPassengers: +form.maxPassengers });
    setEditMode(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
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
              <p className="text-xs" style={{ color: '#8892a0' }}>
                {boat.owner}
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
              {/* KPI */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Tổng booking',
                    value: String(boat.totalBookings),
                    icon: <Users size={14} />,
                    color: '#3B82F6',
                  },
                  {
                    label: 'Doanh thu',
                    value: `₫${fmt(boat.revenue)}`,
                    icon: <DollarSign size={14} />,
                    color: '#10B981',
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl p-4" style={CARD}>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: item.color }}>{item.icon}</span>
                      <span
                        className="text-[10px]"
                        style={{ color: '#8892a0' }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <p
                      className="text-base font-bold"
                      style={{ color: '#fff' }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

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
                    {[
                      { label: 'Tên thuyền', key: 'name', span: 2 },
                      { label: 'Chủ sở hữu', key: 'owner', span: 2 },
                      { label: 'Sức chứa tối đa', key: 'maxPassengers' },
                    ].map(({ label, key, span }) => (
                      <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                        <label
                          className="block text-[10px] font-semibold mb-1"
                          style={{ color: '#8892a0' }}
                        >
                          {label}
                        </label>
                        <input
                          value={form[key as keyof typeof form]}
                          onChange={(e) =>
                            setForm({ ...form, [key]: e.target.value })
                          }
                          className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                          }}
                        />
                      </div>
                    ))}
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
                          setForm({ ...form, type: e.target.value as BoatType })
                        }
                        className="w-full rounded-lg px-3 py-2 text-xs outline-none"
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
                    <div>
                      <label
                        className="block text-[10px] font-semibold mb-1"
                        style={{ color: '#8892a0' }}
                      >
                        Bến tàu
                      </label>
                      <select
                        value={form.dock}
                        onChange={(e) =>
                          setForm({ ...form, dock: e.target.value })
                        }
                        className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      >
                        {DOCKS.map((d) => (
                          <option
                            key={d}
                            value={d}
                            style={{ backgroundColor: '#0d1629' }}
                          >
                            {d}
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
                          setForm({
                            ...form,
                            status: e.target.value as BoatStatus,
                          })
                        }
                        className="w-full rounded-lg px-3 py-2 text-xs outline-none"
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
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-90"
                      style={{ backgroundColor: ACCENT, color: '#fff' }}
                    >
                      <Save size={12} /> Lưu thay đổi
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="rounded-lg px-4 py-2 text-xs font-semibold hover:bg-white/5"
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
                      value: BOAT_TYPE_LABELS[boat.type],
                    },
                    {
                      label: 'Sức chứa tối đa',
                      value: `${boat.maxPassengers} khách`,
                    },
                    { label: 'Bến tàu', value: boat.dock },
                    { label: 'Chủ sở hữu', value: boat.owner },
                    { label: 'Ngày tạo', value: boat.createdAt },
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

          {/* CABINS TAB */}
          {activeTab === 'cabins' && (
            <CabinTab boat={boat} onUpdate={onUpdate} />
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <ServiceTab boat={boat} onUpdate={onUpdate} />
          )}

          {/* IMAGES TAB */}
          {activeTab === 'images' && (
            <div className="space-y-4">
              <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                Hình ảnh thuyền
              </p>
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
                      className="rounded-xl overflow-hidden"
                      style={CARD}
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.caption}
                        className="w-full aspect-video object-cover"
                      />
                      {img.caption && (
                        <p
                          className="px-3 py-2 text-xs"
                          style={{ color: '#8892a0' }}
                        >
                          {img.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════ ADD/EDIT BOAT MODAL ═══════════════════ */
function BoatFormModal({
  editBoat,
  onClose,
  onSave,
}: {
  editBoat?: Boat;
  onClose: () => void;
  onSave: (data: Partial<Boat>) => void;
}) {
  const [form, setForm] = useState({
    name: editBoat?.name ?? '',
    type: editBoat?.type ?? ('cruise' as BoatType),
    owner: editBoat?.owner ?? '',
    maxPassengers: String(editBoat?.maxPassengers ?? ''),
    status: editBoat?.status ?? ('idle' as BoatStatus),
    dock: editBoat?.dock ?? DOCKS[0],
  });

  const handleSave = () => {
    if (!form.name || !form.owner || !form.maxPassengers) return;
    onSave({ ...form, maxPassengers: +form.maxPassengers });
    onClose();
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
              {editBoat ? 'Chỉnh sửa thuyền' : 'Thêm thuyền mới'}
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
            {[
              {
                label: 'Tên thuyền *',
                key: 'name',
                placeholder: 'VD: Rồng Vàng',
              },
              {
                label: 'Chủ sở hữu *',
                key: 'owner',
                placeholder: 'VD: Du thuyền Hoàng Gia',
              },
              {
                label: 'Sức chứa tối đa *',
                key: 'maxPassengers',
                placeholder: '40',
              },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label
                  className="block text-[11px] font-semibold mb-1.5"
                  style={{ color: '#8892a0' }}
                >
                  {label}
                </label>
                <input
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
              </div>
            ))}
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
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as BoatType })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
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
                  Bến tàu
                </label>
                <select
                  value={form.dock}
                  onChange={(e) => setForm({ ...form, dock: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                >
                  {DOCKS.map((d) => (
                    <option
                      key={d}
                      value={d}
                      style={{ backgroundColor: '#0a0f1e' }}
                    >
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              <Save size={14} /> {editBoat ? 'Lưu thay đổi' : 'Tạo thuyền'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-white/5 transition-all"
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
export default function OwnerBoats() {
  const [boats, setBoats] = useState<Boat[]>(MOCK_BOATS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<BoatStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<BoatType | 'all'>('all');
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editBoat, setEditBoat] = useState<Boat | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const stats = useMemo(
    () => ({
      total: boats.length,
      active: boats.filter((b) => b.status === 'active').length,
      maintenance: boats.filter((b) => b.status === 'maintenance').length,
      idle: boats.filter((b) => b.status === 'idle').length,
      totalRevenue: boats.reduce((s, b) => s + b.revenue, 0),
      totalPassengers: boats.reduce((s, b) => s + b.maxPassengers, 0),
    }),
    [boats],
  );

  const filtered = useMemo(
    () =>
      boats.filter((b) => {
        const matchSearch =
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.owner.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || b.status === filterStatus;
        const matchType = filterType === 'all' || b.type === filterType;
        return matchSearch && matchStatus && matchType;
      }),
    [boats, search, filterStatus, filterType],
  );

  const handleUpdate = (updated: Boat) => {
    setBoats((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (selectedBoat?.id === updated.id) setSelectedBoat(updated);
  };

  const handleSave = (data: Partial<Boat>) => {
    if (editBoat) {
      const updated = { ...editBoat, ...data };
      setBoats((prev) => prev.map((b) => (b.id === editBoat.id ? updated : b)));
    } else {
      const newBoat: Boat = {
        id: `boat-${Date.now()}`,
        name: data.name!,
        type: data.type!,
        owner: data.owner!,
        maxPassengers: data.maxPassengers!,
        status: data.status!,
        dock: data.dock!,
        totalBookings: 0,
        revenue: 0,
        createdAt: new Date().toISOString().split('T')[0],
        cabins: [],
        services: [],
        images: [],
      };
      setBoats((prev) => [newBoat, ...prev]);
    }
    setEditBoat(undefined);
  };

  const handleDelete = (id: string) => {
    setBoats((prev) => prev.filter((b) => b.id !== id));
    setConfirmDelete(null);
    if (selectedBoat?.id === id) setSelectedBoat(null);
  };

  const KPI_STATS = [
    {
      label: 'Tổng thuyền',
      value: stats.total,
      icon: <Ship size={18} />,
      color: ACCENT,
      bg: ACCENT_BG,
      change: '+2 tháng này',
      up: true,
    },
    {
      label: 'Đang hoạt động',
      value: stats.active,
      icon: <CheckCircle size={18} />,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.12)',
      change: `${Math.round((stats.active / stats.total) * 100)}% tổng`,
      up: true,
    },
    {
      label: 'Đang bảo trì',
      value: stats.maintenance,
      icon: <Wrench size={18} />,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      change: 'cần theo dõi',
      up: false,
    },
    {
      label: 'Nhàn rỗi',
      value: stats.idle,
      icon: <Clock size={18} />,
      color: '#8892a0',
      bg: 'rgba(136,146,160,0.12)',
      change: 'sẵn sàng triển khai',
      up: true,
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
            {boats.length} thuyền · tổng sức chứa {fmt(stats.totalPassengers)}{' '}
            khách
          </p>
        </div>
        <button
          onClick={() => {
            setEditBoat(undefined);
            setShowForm(true);
          }}
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
              <span
                className="flex items-center gap-1 text-[10px] font-semibold"
                style={{ color: s.up ? '#10B981' : '#F59E0B' }}
              >
                {s.up ? (
                  <ArrowUpRight size={11} />
                ) : (
                  <ArrowDownRight size={11} />
                )}
                {s.change}
              </span>
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên thuyền hoặc chủ sở hữu..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
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
                onClick={() => setFilterStatus(s)}
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
              onChange={(e) =>
                setFilterType(e.target.value as BoatType | 'all')
              }
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
        <div
          className="flex items-center justify-between border-b px-6 py-3"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs font-semibold" style={{ color: '#8892a0' }}>
            Hiển thị {filtered.length}/{boats.length} thuyền
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 700 }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <tr className="text-left">
                {[
                  'Thuyền',
                  'Chủ sở hữu',
                  'Loại',
                  'Sức chứa',
                  'Bến tàu',
                  'Cabin/DV',
                  'Trạng thái',
                  '',
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-sm"
                    style={{ color: '#8892a0' }}
                  >
                    Không tìm thấy thuyền nào
                  </td>
                </tr>
              ) : (
                filtered.map((boat) => (
                  <tr
                    key={boat.id}
                    className="group transition-colors hover:bg-white/2"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: ACCENT_BG }}
                        >
                          <Ship size={14} style={{ color: ACCENT }} />
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
                            ID: {boat.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: '#c8d0e0' }}
                    >
                      {boat.owner}
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
                      <div className="flex items-center gap-1">
                        <Anchor size={11} style={{ color: '#8892a0' }} />
                        {boat.dock}
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
                        {boat.cabins.length}
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
                        {boat.services.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={boat.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedBoat(boat)}
                          className="rounded-lg p-1.5 hover:bg-white/10"
                          style={{ color: '#3B82F6' }}
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditBoat(boat);
                            setShowForm(true);
                          }}
                          className="rounded-lg p-1.5 hover:bg-white/10"
                          style={{ color: '#c8d0e0' }}
                          title="Chỉnh sửa"
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
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
                style={{ backgroundColor: '#EF4444', color: '#fff' }}
              >
                Xoá thuyền
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
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
      {selectedBoat && (
        <BoatDetailDrawer
          boat={selectedBoat}
          onClose={() => setSelectedBoat(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <BoatFormModal
          editBoat={editBoat}
          onClose={() => {
            setShowForm(false);
            setEditBoat(undefined);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
