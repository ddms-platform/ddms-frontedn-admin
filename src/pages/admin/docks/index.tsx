import { useState, useMemo } from 'react';
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
} from 'lucide-react';

/* ─────────────────────── Design tokens ─────────────────────── */
const ACCENT = '#FF385C';
const ACCENT_BG = 'rgba(255,56,92,0.12)';
const CARD: React.CSSProperties = {
  backgroundColor: '#ffffff', boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px', borderRadius: '20px',
  border: '1px solid #e5e7eb',
};

/* ─────────────────────── Types ─────────────────────── */
interface Dock {
  id: string;
  name: string;
  location: string;
  maxBoats: number;
  currentBoats: number;
  isActive: boolean;
  contactPhone?: string;
  description?: string;
  createdAt: string;
}

/* ─────────────────────── Mock data ─────────────────────── */
const MOCK_DOCKS: Dock[] = [
  { id: 'd1', name: 'Bến Tuần Châu', location: 'Hạ Long, Quảng Ninh', maxBoats: 20, currentBoats: 15, isActive: true, contactPhone: '0203-846-xxxx', description: 'Bến tàu lớn nhất vịnh Hạ Long, kết nối trực tiếp với tuyến du lịch biển đảo.', createdAt: '2023-01-10' },
  { id: 'd2', name: 'Bến Cát Bà', location: 'Cát Bà, Hải Phòng', maxBoats: 12, currentBoats: 8, isActive: true, contactPhone: '0225-688-xxxx', description: 'Bến tàu nằm trong vùng lõi vườn quốc gia Cát Bà.', createdAt: '2023-03-05' },
  { id: 'd3', name: 'Bến Bạch Đằng', location: 'Quận 1, TP.HCM', maxBoats: 30, currentBoats: 22, isActive: true, contactPhone: '028-3829-xxxx', description: 'Bến tàu trung tâm thành phố, kết nối các tuyến sông Sài Gòn.', createdAt: '2023-02-15' },
  { id: 'd4', name: 'Bến Cần Thơ', location: 'Ninh Kiều, Cần Thơ', maxBoats: 10, currentBoats: 4, isActive: true, contactPhone: '0292-381-xxxx', description: 'Bến tàu trên sông Hậu, phục vụ du lịch miền Tây sông nước.', createdAt: '2023-06-20' },
  { id: 'd5', name: 'Bến Nha Trang', location: 'Nha Trang, Khánh Hòa', maxBoats: 18, currentBoats: 11, isActive: false, contactPhone: '0258-352-xxxx', description: 'Bến tàu phục vụ các tuyến du lịch đảo Nha Trang.', createdAt: '2023-04-12' },
  { id: 'd6', name: 'Bến Phú Quốc', location: 'Dương Đông, Kiên Giang', maxBoats: 25, currentBoats: 19, isActive: true, contactPhone: '0297-399-xxxx', description: 'Bến tàu hiện đại phục vụ du lịch đảo Phú Quốc.', createdAt: '2023-08-30' },
];

/* ─────────────────────── Sub-components ─────────────────────── */

function CapacityBar({ current, max }: { current: number; max: number }) {
  const pct = Math.round((current / max) * 100);
  const barColor = pct > 85 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#10B981';
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 text-xs">
        <span style={{ color: '#6a6a6a' }}>
          <Ship size={10} className="inline mr-1" />{current}/{max} thuyền
        </span>
        <span className="font-bold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: '#f2f2f2' }}>
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold"
      style={isActive
        ? { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }
        : { backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
      {isActive ? <CheckCircle size={10} /> : <PauseCircle size={10} />}
      {isActive ? 'Hoạt động' : 'Tạm dừng'}
    </span>
  );
}

/* ─────────────────────── Dock Form Modal ─────────────────────── */
function DockFormModal({ editDock, onClose, onSave }: {
  editDock?: Dock;
  onClose: () => void;
  onSave: (data: Partial<Dock>) => void;
}) {
  const [form, setForm] = useState({
    name: editDock?.name ?? '',
    location: editDock?.location ?? '',
    maxBoats: String(editDock?.maxBoats ?? ''),
    currentBoats: String(editDock?.currentBoats ?? '0'),
    isActive: editDock?.isActive ?? true,
    contactPhone: editDock?.contactPhone ?? '',
    description: editDock?.description ?? '',
  });

  const fields = [
    { label: 'Tên bến tàu *', key: 'name', placeholder: 'VD: Bến Tuần Châu', span: 2 },
    { label: 'Địa điểm *', key: 'location', placeholder: 'VD: Hạ Long, Quảng Ninh', span: 2 },
    { label: 'Số thuyền tối đa *', key: 'maxBoats', placeholder: '20' },
    { label: 'Số thuyền hiện tại', key: 'currentBoats', placeholder: '0' },
    { label: 'Điện thoại liên hệ', key: 'contactPhone', placeholder: '02xx-xxx-xxxx', span: 2 },
    { label: 'Mô tả', key: 'description', placeholder: 'Mô tả bến tàu...', span: 2 },
  ];

  const handleSave = () => {
    if (!form.name || !form.location || !form.maxBoats) return;
    onSave({ ...form, maxBoats: +form.maxBoats, currentBoats: +form.currentBoats });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg rounded-2xl p-6 space-y-5 pointer-events-auto shadow-2xl" style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: ACCENT_BG }}>
                <Anchor size={16} style={{ color: ACCENT }} />
              </div>
              <p className="text-base font-bold" style={{ color: '#222222' }}>{editDock ? 'Chỉnh sửa bến tàu' : 'Thêm bến tàu mới'}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/5" style={{ color: '#6a6a6a' }}><X size={16} /></button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ label, key, placeholder, span }) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#6a6a6a' }}>{label}</label>
                <input value={form[key as keyof typeof form] as string}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #c1c1c1', color: '#222222' }} />
              </div>
            ))}
            <div className="col-span-2 flex items-center gap-4 rounded-xl p-3" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
              <span className="text-[11px] font-semibold" style={{ color: '#6a6a6a' }}>Trạng thái bến tàu:</span>
              <div className="flex gap-2">
                {[
                  { val: true, label: 'Hoạt động', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
                  { val: false, label: 'Tạm dừng', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
                ].map(opt => (
                  <button key={String(opt.val)} onClick={() => setForm({ ...form, isActive: opt.val })}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: form.isActive === opt.val ? opt.bg : 'rgba(255,255,255,0.05)',
                      color: form.isActive === opt.val ? opt.color : '#6a6a6a',
                      border: form.isActive === opt.val ? `1px solid ${opt.color}40` : '1px solid transparent',
                    }}>
                    {opt.val ? <CheckCircle size={11} /> : <PauseCircle size={11} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: ACCENT, color: '#222222' }}>
              <Save size={14} /> {editDock ? 'Lưu thay đổi' : 'Tạo bến tàu'}
            </button>
            <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-black/5 transition-all"
              style={{ backgroundColor: '#ffffff', color: '#6a6a6a' }}>
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
  const [docks, setDocks] = useState<Dock[]>(MOCK_DOCKS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [showForm, setShowForm] = useState(false);
  const [editDock, setEditDock] = useState<Dock | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const stats = useMemo(() => ({
    total: docks.length,
    active: docks.filter(d => d.isActive).length,
    totalCurrentBoats: docks.reduce((s, d) => s + d.currentBoats, 0),
    totalMaxBoats: docks.reduce((s, d) => s + d.maxBoats, 0),
    avgOccupancy: Math.round(docks.reduce((s, d) => s + (d.currentBoats / d.maxBoats), 0) / docks.length * 100),
  }), [docks]);

  const filtered = useMemo(() => docks.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? d.isActive : !d.isActive);
    return matchSearch && matchStatus;
  }), [docks, search, filterStatus]);

  const handleSave = (data: Partial<Dock>) => {
    if (editDock) {
      setDocks(prev => prev.map(d => d.id === editDock.id ? { ...d, ...data } : d));
    } else {
      const newDock: Dock = {
        id: `d-${Date.now()}`,
        name: data.name!,
        location: data.location!,
        maxBoats: data.maxBoats!,
        currentBoats: data.currentBoats ?? 0,
        isActive: data.isActive ?? true,
        contactPhone: data.contactPhone,
        description: data.description,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDocks(prev => [newDock, ...prev]);
    }
    setEditDock(undefined);
  };

  const handleDelete = (id: string) => {
    setDocks(prev => prev.filter(d => d.id !== id));
    setConfirmDelete(null);
  };

  const toggleStatus = (id: string) => {
    setDocks(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
  };

  const KPI = [
    { label: 'Tổng bến tàu', value: stats.total, icon: <Anchor size={18} />, color: ACCENT, bg: ACCENT_BG, sub: `${stats.active} đang hoạt động` },
    { label: 'Thuyền đang neo', value: stats.totalCurrentBoats, icon: <Ship size={18} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', sub: `trên ${stats.totalMaxBoats} sức chứa` },
    { label: 'Tỷ lệ lấp đầy', value: `${stats.avgOccupancy}%`, icon: <TrendingUp size={18} />, color: '#10B981', bg: 'rgba(16,185,129,0.12)', sub: 'trung bình toàn hệ thống' },
    { label: 'Sức chứa tổng', value: stats.totalMaxBoats, icon: <ArrowUpRight size={18} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', sub: 'thuyền tối đa' },
  ];

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#222222', letterSpacing: '-0.44px' }}>Quản lý Bến tàu</h1>
          <p className="mt-1 text-sm" style={{ color: '#6a6a6a' }}>Thêm, sửa, xóa bến tàu và quy định sức chứa</p>
        </div>
        <button onClick={() => { setEditDock(undefined); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: ACCENT, color: '#222222' }}>
          <Plus size={16} /> Thêm bến tàu
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI.map(s => (
          <div key={s.label} className="rounded-2xl p-5 transition-all hover:scale-[1.02]" style={CARD}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#222222' }}>{s.value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#6a6a6a' }}>{s.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#6a6a6a' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6a6a6a' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm bến tàu hoặc địa điểm..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
            style={{ backgroundColor: '#ffffff', border: '1px solid #c1c1c1', color: '#222222' }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6a6a6a' }}><X size={14} /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
          style={{ backgroundColor: showFilters ? ACCENT_BG : 'rgba(255,255,255,0.05)', color: showFilters ? ACCENT : '#6a6a6a', border: '1px solid ' + (showFilters ? 'rgba(255,56,92,0.2)' : 'rgba(255,255,255,0.1)') }}>
          <Filter size={14} /> Lọc <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #c1c1c1' }}>
          {(['card', 'table'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors"
              style={{ backgroundColor: viewMode === mode ? ACCENT_BG : 'rgba(255,255,255,0.03)', color: viewMode === mode ? ACCENT : '#6a6a6a' }}>
              {mode === 'card' ? <LayoutGrid size={14} /> : <LayoutList size={14} />}
              {mode === 'card' ? 'Thẻ' : 'Bảng'}
            </button>
          ))}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 items-center rounded-xl p-4" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
          <span className="text-xs font-semibold" style={{ color: '#6a6a6a' }}>Trạng thái:</span>
          {([
            { val: 'all', label: 'Tất cả' },
            { val: 'active', label: 'Hoạt động' },
            { val: 'inactive', label: 'Tạm dừng' },
          ] as const).map(opt => (
            <button key={opt.val} onClick={() => setFilterStatus(opt.val)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              style={{ backgroundColor: filterStatus === opt.val ? ACCENT_BG : 'rgba(255,255,255,0.05)', color: filterStatus === opt.val ? ACCENT : '#6a6a6a', border: filterStatus === opt.val ? '1px solid rgba(255,56,92,0.3)' : '1px solid transparent' }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-xs" style={{ color: '#6a6a6a' }}>Hiển thị {filtered.length}/{docks.length} bến tàu</p>

      {/* CARD VIEW */}
      {viewMode === 'card' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-3 rounded-2xl py-20 text-center" style={CARD}>
              <Anchor size={36} className="mx-auto mb-3" style={{ color: '#6a6a6a' }} />
              <p className="text-sm" style={{ color: '#6a6a6a' }}>Không tìm thấy bến tàu nào</p>
            </div>
          ) : filtered.map(dock => {
            const pct = Math.round((dock.currentBoats / dock.maxBoats) * 100);
            const barColor = pct > 85 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#10B981';
            return (
              <div key={dock.id} className="rounded-2xl p-5 space-y-4 transition-all hover:scale-[1.02] group" style={CARD}>
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: ACCENT_BG }}>
                      <Anchor size={18} style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: '#222222' }}>{dock.name}</h3>
                      <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: '#6a6a6a' }}>
                        <MapPin size={9} />{dock.location}
                      </p>
                    </div>
                  </div>
                  <StatusBadge isActive={dock.isActive} />
                </div>

                {/* Description */}
                {dock.description && (
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#6a6a6a' }}>{dock.description}</p>
                )}

                {/* Capacity bar */}
                <CapacityBar current={dock.currentBoats} max={dock.maxBoats} />

                {/* Meta */}
                {dock.contactPhone && (
                  <p className="text-[10px]" style={{ color: '#6a6a6a' }}>📞 {dock.contactPhone}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => toggleStatus(dock.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: dock.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: dock.isActive ? '#EF4444' : '#10B981' }}>
                    {dock.isActive ? <PauseCircle size={12} /> : <CheckCircle size={12} />}
                    {dock.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                  </button>
                  <button onClick={() => { setEditDock(dock); setShowForm(true); }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: '#ffffff', color: '#6a6a6a' }}>
                    <Edit2 size={12} /> Chỉnh sửa
                  </button>
                  <button onClick={() => setConfirmDelete(dock.id)}
                    className="flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-hidden rounded-2xl" style={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 700 }}>
              <thead style={{ backgroundColor: '#ffffff' }}>
                <tr className="text-left">
                  {['Bến tàu', 'Địa điểm', 'Thuyền neo', 'Tỷ lệ', 'Liên hệ', 'Trạng thái', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#6a6a6a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-sm" style={{ color: '#6a6a6a' }}>Không tìm thấy bến tàu nào</td></tr>
                ) : filtered.map(dock => {
                  const pct = Math.round((dock.currentBoats / dock.maxBoats) * 100);
                  const barColor = pct > 85 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#10B981';
                  return (
                    <tr key={dock.id} className="group transition-colors hover:bg-black/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT_BG }}>
                            <Anchor size={14} style={{ color: ACCENT }} />
                          </div>
                          <p className="text-xs font-semibold" style={{ color: '#222222' }}>{dock.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#6a6a6a' }}>
                        <div className="flex items-center gap-1"><MapPin size={10} style={{ color: '#6a6a6a' }} />{dock.location}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#222222' }}>{dock.currentBoats}<span style={{ color: '#6a6a6a' }}>/{dock.maxBoats}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: '#f2f2f2' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: barColor }}>{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#6a6a6a' }}>{dock.contactPhone ?? '-'}</td>
                      <td className="px-4 py-3"><StatusBadge isActive={dock.isActive} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleStatus(dock.id)} className="rounded-lg p-1.5 hover:bg-black/5" style={{ color: dock.isActive ? '#EF4444' : '#10B981' }} title={dock.isActive ? 'Tạm dừng' : 'Kích hoạt'}>
                            {dock.isActive ? <PauseCircle size={14} /> : <CheckCircle size={14} />}
                          </button>
                          <button onClick={() => { setEditDock(dock); setShowForm(true); }} className="rounded-lg p-1.5 hover:bg-black/5" style={{ color: '#6a6a6a' }} title="Chỉnh sửa"><Edit2 size={14} /></button>
                          <button onClick={() => setConfirmDelete(dock.id)} className="rounded-lg p-1.5 hover:bg-red-500/10" style={{ color: '#EF4444' }} title="Xoá"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: '#ffffff', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                <AlertTriangle size={20} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#222222' }}>Xác nhận xoá bến tàu</p>
                <p className="text-xs mt-0.5" style={{ color: '#6a6a6a' }}>
                  {docks.find(d => d.id === confirmDelete)?.name}
                </p>
              </div>
            </div>
            <p className="text-xs mb-5" style={{ color: '#6a6a6a' }}>Hành động này sẽ không thể hoàn tác. Các thuyền đang neo tại bến cần được chuyển trước khi xoá.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ backgroundColor: '#EF4444', color: '#222222' }}>Xoá bến tàu</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ backgroundColor: '#ffffff', color: '#6a6a6a' }}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <DockFormModal
          editDock={editDock}
          onClose={() => { setShowForm(false); setEditDock(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
