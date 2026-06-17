import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Percent,
  BadgeDollarSign,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Calendar,
  Info,
  Ticket,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { promotionsApi } from '@/services/promotions-api';
import type {
  PromotionResponse,
  CreatePromotionRequest,
} from '@/services/promotions-api';
import { toast } from 'sonner';

const ACCENT = '#FF385C';
const CARD: React.CSSProperties = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

export default function OwnerPromotions() {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Modal / Form states
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      .getOwnerPromotions()
      .then((res) => {
        if (res.status === 200 && res.data?.code === 1000) {
          setPromotions(res.data.result || []);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch owner promotions:', err);
        toast.error('Lỗi khi tải danh sách khuyến mãi của bạn.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
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
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
      toast.error('Vui lòng chọn ngày bắt đầu hiệu lực.');
      return;
    }

    const todayStr = getTodayDateString();
    if (validFrom < todayStr) {
      toast.error('Ngày bắt đầu không thể ở quá khứ.');
      return;
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

    setSubmitting(true);
    try {
      const res = await promotionsApi.createOwnerPromotion(payload);
      if (res.status === 200 && res.data?.code === 1000) {
        toast.success('Gửi yêu cầu duyệt mã giảm giá thành công!');
        handleCloseModal();
        fetchPromotions();
      } else {
        toast.error(res.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Lỗi khi gửi yêu cầu.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        'Bạn có chắc chắn muốn xóa mã giảm giá này? Đối với mã đã duyệt, hành động này sẽ hủy kích hoạt vĩnh viễn.',
      )
    ) {
      try {
        const res = await promotionsApi.deleteOwnerPromotion(id);
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

  // KPIs
  const stats = useMemo(() => {
    return {
      total: promotions.length,
      pending: promotions.filter((p) => p.status === 'pending').length,
      approved: promotions.filter((p) => p.status === 'approved').length,
      rejected: promotions.filter((p) => p.status === 'rejected').length,
    };
  }, [promotions]);

  // Filtering list
  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      const matchSearch =
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [promotions, search, filterStatus]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
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
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Ticket className="text-[#FF385C]" size={28} />
            Quản lý Khuyến mãi
          </h1>
          <p className="mt-1 text-sm text-[#8892a0]">
            Yêu cầu phát hành mã giảm giá cho các dịch vụ tàu & tour của bạn.
            Tất cả mã giảm giá của chủ tàu đều cần được Admin kiểm duyệt.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95 text-white shadow-lg shadow-rose-500/10"
          style={{ backgroundColor: ACCENT }}
        >
          <Plus size={16} /> Yêu cầu mã mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Tổng số mã',
            value: stats.total,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.12)',
            icon: <Ticket size={18} />,
          },
          {
            label: 'Đang chờ duyệt',
            value: stats.pending,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.12)',
            icon: <Clock size={18} />,
          },
          {
            label: 'Đã phê duyệt',
            value: stats.approved,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.12)',
            icon: <CheckCircle size={18} />,
          },
          {
            label: 'Bị từ chối',
            value: stats.rejected,
            color: '#ef4444',
            bg: 'rgba(239,68,68,0.12)',
            icon: <XCircle size={18} />,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-4 flex items-center justify-between"
            style={CARD}
          >
            <div>
              <p className="text-xs font-semibold text-[#8892a0]">
                {item.label}
              </p>
              <p className="text-2xl font-extrabold text-white mt-1">
                {item.value}
              </p>
            </div>
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: item.bg, color: item.color }}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Info Warning */}
      <div className="rounded-xl p-4 flex gap-3 bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">
            Chính sách kiểm duyệt:
          </span>{' '}
          Mã giảm giá do chủ tàu tạo ra chỉ áp dụng cho tour/sản phẩm của chính
          bạn và sẽ bắt đầu ở trạng thái{' '}
          <span className="text-amber-400 font-semibold">Chờ duyệt</span>. Ban
          quản trị hệ thống sẽ duyệt yêu cầu trong vòng 24h làm việc. Sau khi
          duyệt, mã giảm giá sẽ được tự động kích hoạt cho khách hàng áp dụng
          khi đặt tour.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892a0]"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo mã hoặc mô tả..."
            className="w-full bg-[#0d1629] border border-white/10 rounded-xl py-2 px-10 text-sm text-white placeholder-[#8892a0] focus:outline-none focus:border-[#FF385C] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8892a0] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all ${
              showFilters
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-[#0d1629] border-white/10 text-[#8892a0] hover:text-white'
            }`}
          >
            <SlidersHorizontal size={14} />
            Bộ lọc
          </button>

          <div className="flex bg-[#0d1629] border border-white/10 rounded-xl p-0.5">
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  filterStatus === st
                    ? 'bg-[#FF385C] text-white shadow-md'
                    : 'text-[#8892a0] hover:text-white'
                }`}
              >
                {st === 'all'
                  ? 'Tất cả'
                  : st === 'pending'
                    ? 'Chờ duyệt'
                    : st === 'approved'
                      ? 'Đã duyệt'
                      : 'Từ chối'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Filters (Collapsible) */}
      {showFilters && (
        <div
          className="rounded-2xl p-4 grid gap-4 sm:grid-cols-3 animate-fadeIn"
          style={CARD}
        >
          <div>
            <label className="block text-xs font-semibold mb-1 text-[#8892a0]">
              Loại chiết khấu
            </label>
            <select
              className="w-full rounded-xl py-2 px-3 text-xs outline-none bg-white/5 border border-white/10 text-white"
              style={{ colorScheme: 'dark' }}
            >
              <option value="all">Tất cả</option>
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Cố định (đ)</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Content Table / Grid */}
      {loading ? (
        <div className="flex py-16 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF385C]" />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-xl" style={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/2 border-b border-white/5">
                  {[
                    'Mã giảm giá',
                    'Hình thức giảm',
                    'Giá trị giảm',
                    'Đơn hàng tối thiểu',
                    'Giới hạn',
                    'Thời gian áp dụng',
                    'Trạng thái',
                    'Thao tác',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8892a0]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-[#8892a0] italic"
                    >
                      Không tìm thấy mã giảm giá nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredPromotions.map((p) => {
                    const exhausted =
                      p.usageLimit !== null && p.usedCount >= p.usageLimit;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        {/* Code */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor: 'rgba(255, 56, 92, 0.08)',
                              }}
                            >
                              {p.discountType === 'percentage' ? (
                                <Percent size={14} style={{ color: ACCENT }} />
                              ) : (
                                <BadgeDollarSign
                                  size={14}
                                  style={{ color: ACCENT }}
                                />
                              )}
                            </div>
                            <div>
                              <span className="font-mono font-bold text-white tracking-wider text-sm">
                                {p.code}
                              </span>
                              {p.description && (
                                <p
                                  className="text-xs text-[#8892a0] max-w-50 truncate"
                                  title={p.description}
                                >
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-4 text-xs text-white">
                          <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                            {p.discountType === 'percentage'
                              ? 'Phần trăm (%)'
                              : 'Số tiền cố định'}
                          </span>
                        </td>

                        {/* Value */}
                        <td className="px-5 py-4 font-semibold text-white">
                          {p.discountType === 'percentage' ? (
                            <span className="text-[#FF385C] font-extrabold text-sm">
                              {p.discountValue}%
                            </span>
                          ) : (
                            <span className="text-[#FF385C] font-extrabold text-sm">
                              {formatCurrency(p.discountValue)}
                            </span>
                          )}
                          {p.discountType === 'percentage' && p.maxDiscount && (
                            <p className="text-[10px] text-[#8892a0] mt-0.5">
                              Tối đa: {formatCurrency(p.maxDiscount)}
                            </p>
                          )}
                        </td>

                        {/* Min Order */}
                        <td className="px-5 py-4 text-xs text-[#8892a0]">
                          {p.minOrderValue > 0
                            ? formatCurrency(p.minOrderValue)
                            : 'Không yêu cầu'}
                        </td>

                        {/* Limit */}
                        <td className="px-5 py-4 text-xs">
                          <div className="text-white">
                            <span className="font-semibold text-sm">
                              {p.usedCount}
                            </span>
                            <span className="text-[#8892a0]">
                              {' '}
                              / {p.usageLimit ?? '∞'} lượt
                            </span>
                          </div>
                          {p.usageLimit && (
                            <div className="w-20 bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="bg-[#FF385C] h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, (p.usedCount / p.usageLimit) * 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </td>

                        {/* Validity */}
                        <td className="px-5 py-4 text-xs text-[#8892a0]">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className="shrink-0" />
                            <span>
                              {formatDate(p.validFrom)} –{' '}
                              {formatDate(p.validUntil || '')}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className="rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 w-fit"
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
                                <CheckCircle size={12} />{' '}
                                {exhausted
                                  ? 'Hết lượt'
                                  : p.isActive
                                    ? 'Đang chạy'
                                    : 'Đang tắt'}
                              </>
                            ) : p.status === 'rejected' ? (
                              <>
                                <XCircle size={12} /> Bị từ chối
                              </>
                            ) : (
                              <>
                                <Clock size={12} /> Chờ duyệt
                              </>
                            )}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="rounded-lg p-2 hover:bg-red-500/10 text-[#EF4444] transition-colors"
                              title="Xóa mã giảm giá"
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
      )}

      {/* Creation Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCloseModal}
          />
          {/* Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-lg rounded-2xl p-6 space-y-5 pointer-events-auto shadow-2xl overflow-y-auto max-h-[90vh]"
              style={{
                backgroundColor: '#0a0f1e',
                border: '1px solid rgba(255, 56, 92, 0.2)',
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <p className="text-lg font-bold text-white flex items-center gap-2">
                  <Ticket size={20} className="text-[#FF385C]" />
                  Yêu cầu cấp mã giảm giá mới
                </p>
                <button
                  onClick={handleCloseModal}
                  className="rounded-lg p-1.5 hover:bg-white/10 text-[#8892a0] hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Coupon Code */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                      Mã giảm giá *
                    </label>
                    <input
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.toUpperCase().replace(/\s/g, ''))
                      }
                      placeholder="VD: KHUYENMAI20 (Viết liền không dấu)"
                      required
                      className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-[#FF385C] transition-colors font-mono tracking-wider"
                    />
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                      Loại chiết khấu *
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) =>
                        setDiscountType(
                          e.target.value as 'percentage' | 'fixed',
                        )
                      }
                      className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-[#FF385C] transition-colors"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="percentage">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (đ)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                      Giá trị giảm * (
                      {discountType === 'percentage' ? '%' : 'đ'})
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
                      placeholder={
                        discountType === 'percentage' ? 'VD: 15' : 'VD: 50000'
                      }
                      required
                      min={1}
                      className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-[#FF385C] transition-colors"
                    />
                  </div>

                  {/* Min Order Value */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                      Đơn tối thiểu (đ)
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
                      placeholder="VD: 500000 (0 nếu không yêu cầu)"
                      className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-[#FF385C] transition-colors"
                    />
                  </div>

                  {/* Max Discount Value (for percentage type) */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#8892a0] disabled:opacity-50">
                      Giảm tối đa (đ)
                    </label>
                    <input
                      type="number"
                      value={maxDiscount || ''}
                      onChange={(e) =>
                        setMaxDiscount(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      placeholder="Để trống nếu không giới hạn"
                      disabled={discountType !== 'percentage'}
                      className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-[#FF385C] disabled:opacity-50 transition-colors"
                    />
                  </div>

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                      Tổng số lượt sử dụng tối đa
                    </label>
                    <input
                      type="number"
                      value={usageLimit || ''}
                      onChange={(e) =>
                        setUsageLimit(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      placeholder="Để trống nếu không giới hạn"
                      className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-[#FF385C] transition-colors"
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                      Ngày bắt đầu *
                    </label>
                    <input
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      required
                      min={getTodayDateString()}
                      className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-[#FF385C] transition-colors"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      min={
                        validFrom
                          ? getNextDateString(validFrom)
                          : getTodayDateString()
                      }
                      className="w-full rounded-xl py-2.5 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-[#FF385C] transition-colors"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1.5 text-[#8892a0]">
                      Mô tả mã giảm giá
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả thông tin chi tiết của khuyến mãi..."
                      rows={2}
                      className="w-full rounded-xl py-2 px-4 text-sm outline-none bg-white/5 border border-white/10 text-white focus:border-[#FF385C] transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all text-white disabled:opacity-50 disabled:scale-100"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      'Gửi yêu cầu duyệt'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-white/5 transition-all"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#c8d0e0',
                    }}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
