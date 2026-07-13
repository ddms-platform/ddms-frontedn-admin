import { useState, useEffect } from 'react';
import {
  Plus,
  Tag,
  Edit2,
  Trash2,
  Percent,
  BadgeDollarSign,
  Loader2,
  User,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { promotionsApi } from '@/services/promotions-api';
import type {
  PromotionResponse,
  CreatePromotionRequest,
} from '@/services/promotions-api';
import { toast } from 'sonner';
import DateInput from '@/components/ui/date-input';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type ActiveTab = 'admin' | 'owner';

export default function AdminPromotions() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('admin');
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    'percentage',
  );
  const [discountValue, setDiscountValue] = useState<number | string>(0);
  const [minOrderValue, setMinOrderValue] = useState<number | string>(0);
  const [maxDiscount, setMaxDiscount] = useState<number | null>(null);
  const [usageLimit, setUsageLimit] = useState<number | null>(null);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const fetchPromotions = () => {
    setLoading(true);
    promotionsApi
      .getAdminPromotions()
      .then((res) => {
        if (res.status === 200 && res.data?.code === 1000) {
          setPromotions(res.data.result || []);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch promotions:', err);
        toast.error('Lỗi khi tải danh sách khuyến mãi.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPromotions();
  }, []);

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(0);
    setMinOrderValue(0);
    setMaxDiscount(null);
    setUsageLimit(null);
    setValidFrom('');
    setValidUntil('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (p: PromotionResponse) => {
    setCode(p.code);
    setDescription(p.description || '');
    setDiscountType(p.discountType);
    setDiscountValue(p.discountValue);
    setMinOrderValue(p.minOrderValue);
    setMaxDiscount(p.maxDiscount);
    setUsageLimit(p.usageLimit);
    setValidFrom(p.validFrom ? p.validFrom.split('T')[0] : '');
    setValidUntil(p.validUntil ? p.validUntil.split('T')[0] : '');
    setEditingId(p.id);
    setShowForm(true);
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getNextDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã giảm giá.');
      return;
    }
    const discountNum = Number(discountValue);
    if (discountNum <= 0) {
      toast.error('Giá trị giảm giá phải lớn hơn 0.');
      return;
    }
    if (!validFrom) {
      toast.error('Vui lòng chọn ngày bắt đầu.');
      return;
    }

    if (!editingId) {
      const todayStr = getTodayDateString();
      if (validFrom < todayStr) {
        toast.error('Ngày bắt đầu không thể ở quá khứ.');
        return;
      }
    }

    if (validUntil && validUntil <= validFrom) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    const payload: CreatePromotionRequest = {
      code: code.trim().toUpperCase(),
      description: description || null,
      discountType,
      discountValue: discountNum,
      minOrderValue: Number(minOrderValue),
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
    };

    try {
      if (editingId) {
        const res = await promotionsApi.updateAdminPromotion(
          editingId,
          payload,
        );
        if (res.status === 200 && res.data?.code === 1000) {
          toast.success('Cập nhật mã giảm giá thành công!');
          resetForm();
          fetchPromotions();
        } else {
          toast.error(
            res.data?.message || 'Có lỗi xảy ra khi cập nhật mã giảm giá.',
          );
        }
      } else {
        const res = await promotionsApi.createAdminPromotion(payload);
        if (res.status === 200 && res.data?.code === 1000) {
          toast.success('Tạo mã giảm giá thành công!');
          resetForm();
          fetchPromotions();
        } else {
          toast.error(
            res.data?.message || 'Có lỗi xảy ra khi tạo mã giảm giá.',
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi thực hiện thao tác.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        const res = await promotionsApi.deleteAdminPromotion(id);
        if (res.status === 200) {
          toast.success('Đã xóa mã giảm giá thành công.');
          fetchPromotions();
        } else {
          toast.error('Lỗi khi xóa mã giảm giá.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi xóa mã giảm giá.');
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await promotionsApi.toggleActivePromotion(id);
      if (res.status === 200) {
        toast.success(
          res.data.result.isActive
            ? 'Đã kích hoạt mã giảm giá.'
            : 'Đã tắt mã giảm giá.',
        );
        fetchPromotions();
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi thay đổi trạng thái hoạt động.');
    }
  };

  const handleApprove = async (id: string) => {
    if (confirm('Bạn có chắc chắn duyệt mã giảm giá đối tác này không?')) {
      try {
        const res = await promotionsApi.approvePromotion(id);
        if (res.status === 200) {
          toast.success('Đã duyệt mã giảm giá đối tác.');
          fetchPromotions();
        }
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi duyệt.');
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Bạn có chắc chắn từ chối mã giảm giá đối tác này không?')) {
      try {
        const res = await promotionsApi.rejectPromotion(id);
        if (res.status === 200) {
          toast.success('Đã từ chối mã giảm giá đối tác.');
          fetchPromotions();
        }
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi từ chối.');
      }
    }
  };

  const adminPromos = promotions.filter(
    (p) => p.creatorRole === 'admin' || p.createdBy == null,
  );
  const ownerPromos = promotions.filter((p) => p.creatorRole === 'owner');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Không thời hạn';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Quản lý Khuyến mãi
          </h1>
          <p className="mt-1 text-sm text-[#8892a0]">
            Tạo và quản lý mã giảm giá hệ thống hoặc duyệt mã giảm giá của chủ
            tàu đối tác
          </p>
        </div>
        {activeTab === 'admin' && (
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95 text-white"
            style={{ backgroundColor: ACCENT }}
          >
            <Plus size={16} /> {showForm ? 'Hủy' : 'Tạo mã mới'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => {
            setActiveTab('admin');
            resetForm();
          }}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'admin'
              ? 'border-[#FF385C] text-white'
              : 'border-transparent text-[#8892a0] hover:text-white'
          }`}
        >
          <Tag size={16} />
          Mã Hệ thống (Admin) ({adminPromos.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('owner');
            resetForm();
          }}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'owner'
              ? 'border-[#FF385C] text-white'
              : 'border-transparent text-[#8892a0] hover:text-white'
          }`}
        >
          <User size={16} />
          Mã Đối tác (Owner) (
          {ownerPromos.filter((p) => p.status === 'pending').length} chờ duyệt)
        </button>
      </div>

      {/* Form (only for admin creation) */}
      {showForm && activeTab === 'admin' && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4 animate-fadeIn"
          style={CARD}
        >
          <h2 className="text-base font-semibold text-white">
            {editingId
              ? 'Cập nhật mã khuyến mãi'
              : 'Tạo mã khuyến mãi hệ thống'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                Mã giảm giá
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: SUMMER26"
                required
                disabled={!!editingId}
                className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                Loại giảm giá
              </label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as 'percentage' | 'fixed')
                }
                className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white"
                style={{ colorScheme: 'dark' }}
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VND)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                Giá trị
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setDiscountValue(val === '' ? '' : Number(val));
                }}
                onFocus={() => {
                  if (discountValue === 0) setDiscountValue('');
                }}
                onBlur={() => {
                  if (discountValue === '') setDiscountValue(0);
                }}
                placeholder="VD: 15 hoặc 50000"
                required
                className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                Đơn hàng tối thiểu (₫)
              </label>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setMinOrderValue(val === '' ? '' : Number(val));
                }}
                onFocus={() => {
                  if (minOrderValue === 0) setMinOrderValue('');
                }}
                onBlur={() => {
                  if (minOrderValue === '') setMinOrderValue(0);
                }}
                placeholder="VD: 500000"
                className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                Giới hạn lượt dùng
              </label>
              <input
                type="number"
                value={usageLimit || ''}
                onChange={(e) =>
                  setUsageLimit(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Để trống nếu không giới hạn"
                className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                Ngày bắt đầu
              </label>
              <DateInput
                value={validFrom}
                onChange={setValidFrom}
                required
                min={editingId ? undefined : getTodayDateString()}
                className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                Ngày kết thúc
              </label>
              <DateInput
                value={validUntil}
                onChange={setValidUntil}
                min={
                  validFrom
                    ? getNextDateString(validFrom)
                    : editingId
                      ? undefined
                      : getTodayDateString()
                }
                className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                Mô tả mã giảm giá
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả..."
                className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-white/5 text-[#c8d0e0]"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Content tabs */}
      {loading ? (
        <div className="flex py-12 justify-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: ACCENT }} />
        </div>
      ) : activeTab === 'admin' ? (
        // Admin Table
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/2 border-b border-white/5">
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
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8892a0]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminPromos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-[#8892a0]"
                    >
                      Không có mã giảm giá hệ thống nào.
                    </td>
                  </tr>
                ) : (
                  adminPromos.map((p) => {
                    const exhausted =
                      p.usageLimit !== null && p.usedCount >= p.usageLimit;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-lg"
                              style={{ backgroundColor: 'rgba(255,56,92,0.1)' }}
                            >
                              {p.discountType === 'percentage' ? (
                                <Percent size={13} style={{ color: ACCENT }} />
                              ) : (
                                <BadgeDollarSign
                                  size={13}
                                  style={{ color: ACCENT }}
                                />
                              )}
                            </div>
                            <span className="font-mono font-semibold text-white">
                              {p.code}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#8892a0]">
                          {p.discountType === 'percentage'
                            ? 'Phần trăm'
                            : 'Cố định'}
                        </td>
                        <td
                          className="px-5 py-3.5 font-semibold"
                          style={{ color: ACCENT }}
                        >
                          {p.discountType === 'percentage'
                            ? `${p.discountValue}%`
                            : formatCurrency(p.discountValue)}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#8892a0]">
                          {p.minOrderValue
                            ? formatCurrency(p.minOrderValue)
                            : 'Không'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#8892a0]">
                          {p.usageLimit
                            ? `${p.usedCount}/${p.usageLimit}`
                            : `${p.usedCount} lượt dùng`}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#8892a0]">
                          {formatDate(p.validFrom)} – {formatDate(p.validUntil)}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleToggleActive(p.id)}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all hover:opacity-80"
                            style={
                              p.isActive && !exhausted
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
                            {exhausted
                              ? 'Hết lượt'
                              : p.isActive
                                ? 'Đang chạy'
                                : 'Đang tắt'}
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="rounded-lg p-1.5 hover:bg-white/5 transition-colors text-[#8892a0]"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="rounded-lg p-1.5 hover:bg-white/5 transition-colors text-[#EF4444]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Owner Table (Pending & History)
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/2 border-b border-white/5">
                  {[
                    'Mã',
                    'Chủ tàu (Owner)',
                    'Chi tiết giảm giá',
                    'Thời hạn',
                    'Trạng thái',
                    'Hành động',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8892a0]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ownerPromos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-[#8892a0]"
                    >
                      Không có yêu cầu duyệt mã giảm giá đối tác nào.
                    </td>
                  </tr>
                ) : (
                  ownerPromos.map((p) => {
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-semibold text-white">
                            {p.code}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-semibold text-white flex items-center gap-1">
                              <User size={13} className="text-[#8892a0]" />
                              {p.creatorName}
                            </p>
                            <p className="text-xs text-[#8892a0] flex items-center gap-1">
                              <Mail size={11} />
                              {p.creatorEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs text-white">
                            Giảm:{' '}
                            <span className="font-bold text-[#FF385C]">
                              {p.discountType === 'percentage'
                                ? `${p.discountValue}%`
                                : formatCurrency(p.discountValue)}
                            </span>
                            <br />
                            <span className="text-[#8892a0]">
                              Đơn tối thiểu:{' '}
                              {p.minOrderValue
                                ? formatCurrency(p.minOrderValue)
                                : 'Không'}
                              {p.usageLimit
                                ? ` · Giới hạn: ${p.usageLimit} lượt`
                                : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#8892a0]">
                          {formatDate(p.validFrom)} – {formatDate(p.validUntil)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="rounded-lg px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1 w-fit"
                            style={
                              p.status === 'approved'
                                ? {
                                    backgroundColor: 'rgba(16,185,129,0.12)',
                                    color: '#10B981',
                                  }
                                : p.status === 'rejected'
                                  ? {
                                      backgroundColor: 'rgba(239,68,68,0.12)',
                                      color: '#EF4444',
                                    }
                                  : {
                                      backgroundColor: 'rgba(245,158,11,0.12)',
                                      color: '#F59E0B',
                                    }
                            }
                          >
                            {p.status === 'approved' ? (
                              <>
                                <CheckCircle size={10} /> Đã duyệt
                              </>
                            ) : p.status === 'rejected' ? (
                              <>
                                <XCircle size={10} /> Bị từ chối
                              </>
                            ) : (
                              <>
                                <Clock size={10} /> Chờ duyệt
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {p.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(p.id)}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold bg-emerald-500/12 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleReject(p.id)}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold bg-rose-500/12 text-rose-400 hover:bg-rose-500/20 transition-all"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-[#8892a0] italic">
                              Đã xử lý
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
