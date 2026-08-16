import { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Ship,
  Wrench,
  Wallet,
  ArrowUpRight,
  User,
  Mail,
  Calendar,
  Building,
  AlertTriangle,
} from 'lucide-react';
import { approvalsApi } from '@/services/approvals-api';
import type {
  MaintenanceResponse,
  WithdrawalResponse,
} from '@/services/approvals-api';
import { toast } from 'sonner';
import Pagination from '@/components/shared/pagination';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type ActiveTab = 'maintenance' | 'withdrawal';
type RequestStatus = 'pending' | 'approved' | 'rejected';

const STATUS_MAP: Record<
  RequestStatus,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: {
    label: 'Đang chờ',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    icon: Clock,
  },
  approved: {
    label: 'Đã duyệt / Thành công',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Từ chối / Thất bại',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    icon: XCircle,
  },
};

export default function AdminApprovals() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('maintenance');

  // Maintenance states
  const [maintenances, setMaintenances] = useState<MaintenanceResponse[]>([]);
  const [mtFilter, setMtFilter] = useState<'all' | RequestStatus>('all');
  const [mtLoading, setMtLoading] = useState(true);
  const [mtPage, setMtPage] = useState(1);
  const [mtPageSize, setMtPageSize] = useState(5);

  // Withdrawal states
  const [withdrawals, setWithdrawals] = useState<WithdrawalResponse[]>([]);
  const [wdFilter, setWdFilter] = useState<'all' | RequestStatus>('all');
  const [wdLoading, setWdLoading] = useState(true);
  const [wdPage, setWdPage] = useState(1);
  const [wdPageSize, setWdPageSize] = useState(5);

  // Modal confirm state
  const [confirmWdModal, setConfirmWdModal] = useState<{
    isOpen: boolean;
    withdrawal: WithdrawalResponse | null;
  }>({
    isOpen: false,
    withdrawal: null,
  });

  const fetchMaintenances = () => {
    setMtLoading(true);
    approvalsApi
      .getMaintenances()
      .then((res) => {
        if (res.status === 200 && res.data?.code === 1000) {
          setMaintenances(res.data.result || []);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch maintenances:', err);
        toast.error('Lỗi khi tải danh sách bảo trì.');
      })
      .finally(() => {
        setMtLoading(false);
      });
  };

  const fetchWithdrawals = () => {
    setWdLoading(true);
    approvalsApi
      .getWithdrawals()
      .then((res) => {
        if (res.status === 200 && res.data?.code === 1000) {
          setWithdrawals(res.data.result || []);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch withdrawals:', err);
        toast.error('Lỗi khi tải danh sách rút tiền.');
      })
      .finally(() => {
        setWdLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMaintenances();

    fetchWithdrawals();
  }, []);

  // Maintenance Actions
  const handleApproveMt = async (id: string) => {
    if (
      confirm(
        'Bạn có chắc chắn muốn DUYỆT yêu cầu bảo trì này? Chi phí sẽ được tính vào công nợ của chủ thuyền.',
      )
    ) {
      try {
        const res = await approvalsApi.approveMaintenance(id);
        if (res.status === 200) {
          toast.success(
            'Đã duyệt yêu cầu bảo trì thành công và gửi email thông báo.',
          );
          fetchMaintenances();
        } else {
          toast.error('Có lỗi xảy ra khi duyệt yêu cầu bảo trì.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi duyệt yêu cầu bảo trì.');
      }
    }
  };

  const handleRejectMt = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn TỪ CHỐI yêu cầu bảo trì này?')) {
      try {
        const res = await approvalsApi.rejectMaintenance(id);
        if (res.status === 200) {
          toast.success(
            'Đã từ chối yêu cầu bảo trì thành công và gửi email thông báo.',
          );
          fetchMaintenances();
        } else {
          toast.error('Có lỗi xảy ra khi từ chối yêu cầu bảo trì.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi từ chối yêu cầu bảo trì.');
      }
    }
  };

  // Withdrawal Actions
  const handleOpenApproveWd = (wd: WithdrawalResponse) => {
    setConfirmWdModal({
      isOpen: true,
      withdrawal: wd,
    });
  };

  const handleConfirmApproveWd = async () => {
    const wd = confirmWdModal.withdrawal;
    if (!wd) return;

    try {
      const res = await approvalsApi.approveWithdrawal(wd.id);
      if (res.status === 200) {
        toast.success(
          'Đã duyệt yêu cầu rút tiền thành công và gửi email xác nhận.',
        );
        setConfirmWdModal({ isOpen: false, withdrawal: null });
        fetchWithdrawals();
      } else {
        toast.error('Có lỗi xảy ra khi duyệt yêu cầu rút tiền.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi duyệt yêu cầu rút tiền.');
    }
  };

  const handleRejectWd = async (id: string) => {
    if (
      confirm(
        'Bạn có chắc chắn muốn TỪ CHỐI yêu cầu rút tiền này? Số tiền yêu cầu sẽ được tự động hoàn trả lại vào ví của người dùng.',
      )
    ) {
      try {
        const res = await approvalsApi.rejectWithdrawal(id);
        if (res.status === 200) {
          toast.success(
            'Đã từ chối yêu cầu rút tiền thành công. Số tiền đã được hoàn lại vào ví người dùng.',
          );
          fetchWithdrawals();
        } else {
          toast.error('Có lỗi xảy ra khi từ chối yêu cầu rút tiền.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi từ chối yêu cầu rút tiền.');
      }
    }
  };

  // Calculations for Maintenance summary
  const mtPending = maintenances.filter((m) => m.status === 'pending').length;
  const mtApproved = maintenances.filter((m) => m.status === 'approved').length;
  const mtRejected = maintenances.filter((m) => m.status === 'rejected').length;

  // Calculations for Withdrawal summary
  const wdPending = withdrawals.filter((w) => w.status === 'pending').length;
  const wdApproved = withdrawals.filter((w) => w.status === 'approved').length;
  const wdRejected = withdrawals.filter((w) => w.status === 'rejected').length;

  const filteredMaintenances =
    mtFilter === 'all'
      ? maintenances
      : maintenances.filter((m) => m.status === mtFilter);

  const filteredWithdrawals =
    wdFilter === 'all'
      ? withdrawals
      : withdrawals.filter((w) => w.status === wdFilter);

  const mtTotalPages = Math.max(
    1,
    Math.ceil(filteredMaintenances.length / mtPageSize),
  );
  const paginatedMaintenances = filteredMaintenances.slice(
    (mtPage - 1) * mtPageSize,
    mtPage * mtPageSize,
  );

  const wdTotalPages = Math.max(
    1,
    Math.ceil(filteredWithdrawals.length / wdPageSize),
  );
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (wdPage - 1) * wdPageSize,
    wdPage * wdPageSize,
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Quản lý Duyệt & Phê duyệt
          </h1>
          <p className="mt-1 text-sm text-[#8892a0]">
            Duyệt các yêu cầu dịch vụ bảo trì định kỳ của chủ thuyền và giao
            dịch rút tiền của khách hàng
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'maintenance'
              ? 'border-[#FF385C] text-white'
              : 'border-transparent text-[#8892a0] hover:text-white'
          }`}
        >
          <Wrench size={16} />
          Dịch vụ Bảo trì ({mtPending})
        </button>
        <button
          onClick={() => setActiveTab('withdrawal')}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'withdrawal'
              ? 'border-[#FF385C] text-white'
              : 'border-transparent text-[#8892a0] hover:text-white'
          }`}
        >
          <Wallet size={16} />
          Rút tiền về Ngân hàng ({wdPending})
        </button>
      </div>

      {/* Tab Content 1: Maintenance */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Summary metrics */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Bảo trì chờ duyệt',
                value: mtPending,
                color: '#F59E0B',
                bg: 'rgba(245,158,11,0.12)',
                icon: Clock,
              },
              {
                label: 'Bảo trì đã duyệt',
                value: mtApproved,
                color: '#10B981',
                bg: 'rgba(16,185,129,0.12)',
                icon: CheckCircle,
              },
              {
                label: 'Bảo trì bị từ chối',
                value: mtRejected,
                color: '#EF4444',
                bg: 'rgba(239,68,68,0.12)',
                icon: XCircle,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-5 flex items-center gap-4"
                style={CARD}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: s.bg }}
                >
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-[#8892a0]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter subtabs */}
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setMtFilter(f);
                  setMtPage(1);
                }}
                className="rounded-xl px-4 py-2 text-xs font-semibold transition-all"
                style={
                  mtFilter === f
                    ? { backgroundColor: ACCENT, color: '#fff' }
                    : {
                        backgroundColor: '#0d1629',
                        color: '#8892a0',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }
                }
              >
                {f === 'all' ? 'Tất cả' : STATUS_MAP[f].label}
              </button>
            ))}
          </div>

          {/* List of Maintenances */}
          {mtLoading ? (
            <div className="flex py-12 justify-center">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: ACCENT }}
              />
            </div>
          ) : filteredMaintenances.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={CARD}>
              <p className="text-sm text-[#8892a0]">
                Không tìm thấy yêu cầu bảo trì nào phù hợp.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {paginatedMaintenances.map((m) => {
                  const st =
                    STATUS_MAP[m.status as RequestStatus] || STATUS_MAP.pending;
                  const StatusIcon = st.icon;
                  return (
                    <div
                      key={m.id}
                      className="rounded-2xl p-5 transition-all hover:scale-[1.005]"
                      style={CARD}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-white text-base flex items-center gap-1.5">
                              <Ship size={16} className="text-[#8892a0]" />
                              {m.boatName}
                            </span>
                            <span
                              className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                              style={{
                                backgroundColor: st.bg,
                                color: st.color,
                              }}
                            >
                              <StatusIcon size={11} />
                              {st.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
                            <div className="space-y-0.5">
                              <p className="text-[#8892a0] uppercase tracking-wider text-[10px]">
                                Dịch vụ bảo trì
                              </p>
                              <p className="font-semibold text-white">
                                {m.portMaintenanceServiceName}
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[#8892a0] uppercase tracking-wider text-[10px]">
                                Thời gian bắt đầu
                              </p>
                              <p className="text-white flex items-center gap-1">
                                <Calendar
                                  size={12}
                                  className="text-[#8892a0]"
                                />
                                {formatDate(m.startTime)}
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[#8892a0] uppercase tracking-wider text-[10px]">
                                Thời gian hoàn thành
                              </p>
                              <p className="text-white flex items-center gap-1">
                                <Calendar
                                  size={12}
                                  className="text-[#8892a0]"
                                />
                                {formatDate(m.endTime)}
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[#8892a0] uppercase tracking-wider text-[10px]">
                                Chi phí bảo trì
                              </p>
                              <p className="font-bold text-[#FF385C] text-sm">
                                {formatCurrency(m.price)}
                              </p>
                            </div>
                          </div>

                          {m.reason && (
                            <div className="pt-2">
                              <p className="text-[#8892a0] text-xs font-semibold">
                                Lý do bảo trì/Ghi chú thêm:
                              </p>
                              <p className="text-xs text-[#c8d0e0] mt-1 bg-white/5 p-2 rounded-lg italic">
                                {m.reason}
                              </p>
                            </div>
                          )}
                        </div>

                        {m.status === 'pending' && (
                          <div className="flex gap-2 md:flex-col shrink-0 w-full md:w-auto">
                            <button
                              onClick={() => handleApproveMt(m.id)}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-85"
                              style={{
                                backgroundColor: 'rgba(16,185,129,0.12)',
                                color: '#10B981',
                                border: '1px solid rgba(16,185,129,0.2)',
                              }}
                            >
                              <CheckCircle size={13} /> Duyệt
                            </button>
                            <button
                              onClick={() => handleRejectMt(m.id)}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-85"
                              style={{
                                backgroundColor: 'rgba(239,68,68,0.12)',
                                color: '#EF4444',
                                border: '1px solid rgba(239,68,68,0.2)',
                              }}
                            >
                              <XCircle size={13} /> Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Maintenance Pagination */}
              {filteredMaintenances.length > 0 && (
                <div
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl"
                  style={CARD}
                >
                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: '#8892a0' }}
                  >
                    <span>
                      Hiển thị{' '}
                      <strong style={{ color: '#fff' }}>
                        {(mtPage - 1) * mtPageSize + 1} -{' '}
                        {Math.min(
                          mtPage * mtPageSize,
                          filteredMaintenances.length,
                        )}
                      </strong>{' '}
                      trên tổng số{' '}
                      <strong style={{ color: '#fff' }}>
                        {filteredMaintenances.length}
                      </strong>{' '}
                      yêu cầu
                    </span>
                    <select
                      value={mtPageSize}
                      onChange={(e) => {
                        setMtPageSize(Number(e.target.value));
                        setMtPage(1);
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer"
                      style={{
                        backgroundColor: '#141e35',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      }}
                    >
                      <option value={5}>5 / trang</option>
                      <option value={10}>10 / trang</option>
                      <option value={20}>20 / trang</option>
                    </select>
                  </div>

                  <Pagination
                    currentPage={mtPage}
                    totalPages={mtTotalPages}
                    onPageChange={setMtPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Withdrawal */}
      {activeTab === 'withdrawal' && (
        <div className="space-y-6">
          {/* Summary metrics */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Yêu cầu chờ duyệt',
                value: wdPending,
                color: '#F59E0B',
                bg: 'rgba(245,158,11,0.12)',
                icon: Clock,
              },
              {
                label: 'Giao dịch thành công',
                value: wdApproved,
                color: '#10B981',
                bg: 'rgba(16,185,129,0.12)',
                icon: CheckCircle,
              },
              {
                label: 'Giao dịch bị từ chối',
                value: wdRejected,
                color: '#EF4444',
                bg: 'rgba(239,68,68,0.12)',
                icon: XCircle,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-5 flex items-center gap-4"
                style={CARD}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: s.bg }}
                >
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-[#8892a0]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter subtabs */}
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setWdFilter(f);
                  setWdPage(1);
                }}
                className="rounded-xl px-4 py-2 text-xs font-semibold transition-all"
                style={
                  wdFilter === f
                    ? { backgroundColor: ACCENT, color: '#fff' }
                    : {
                        backgroundColor: '#0d1629',
                        color: '#8892a0',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }
                }
              >
                {f === 'all' ? 'Tất cả' : STATUS_MAP[f].label}
              </button>
            ))}
          </div>

          {/* List of Withdrawals */}
          {wdLoading ? (
            <div className="flex py-12 justify-center">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: ACCENT }}
              />
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={CARD}>
              <p className="text-sm text-[#8892a0]">
                Không tìm thấy yêu cầu rút tiền nào phù hợp.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {paginatedWithdrawals.map((w) => {
                  const st =
                    STATUS_MAP[w.status as RequestStatus] || STATUS_MAP.pending;
                  const StatusIcon = st.icon;
                  return (
                    <div
                      key={w.id}
                      className="rounded-2xl p-5 transition-all hover:scale-[1.005]"
                      style={CARD}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-white text-base flex items-center gap-1.5">
                              <User size={16} className="text-[#8892a0]" />
                              {w.userFullName}
                            </span>
                            <span className="text-xs text-[#8892a0] flex items-center gap-1">
                              <Mail size={12} />
                              {w.userEmail}
                            </span>
                            <span
                              className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                              style={{
                                backgroundColor: st.bg,
                                color: st.color,
                              }}
                            >
                              <StatusIcon size={11} />
                              {st.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
                            <div className="space-y-0.5">
                              <p className="text-[#8892a0] uppercase tracking-wider text-[10px]">
                                Số tiền rút
                              </p>
                              <p className="font-bold text-[#10B981] text-base">
                                {formatCurrency(w.amount)}
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[#8892a0] uppercase tracking-wider text-[10px]">
                                Ngân hàng
                              </p>
                              <p className="font-semibold text-white flex items-center gap-1">
                                <Building
                                  size={12}
                                  className="text-[#8892a0]"
                                />
                                {w.bankName}
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[#8892a0] uppercase tracking-wider text-[10px]">
                                Số tài khoản & Tên
                              </p>
                              <p className="text-white">
                                <span className="font-mono font-bold">
                                  {w.accountNumber}
                                </span>
                                <br />
                                <span className="text-[#8892a0]">
                                  {w.accountName}
                                </span>
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[#8892a0] uppercase tracking-wider text-[10px]">
                                Thời gian yêu cầu
                              </p>
                              <p className="text-white flex items-center gap-1">
                                <Calendar
                                  size={12}
                                  className="text-[#8892a0]"
                                />
                                {formatDate(w.createdAt)}
                              </p>
                            </div>
                          </div>

                          {w.processedAt && (
                            <div className="text-[10px] text-[#8892a0] pt-1">
                              Xử lý vào lúc: {formatDate(w.processedAt)}
                            </div>
                          )}
                        </div>

                        {w.status === 'pending' && (
                          <div className="flex gap-2 md:flex-col shrink-0 w-full md:w-auto">
                            <button
                              onClick={() => handleOpenApproveWd(w)}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-85"
                              style={{
                                backgroundColor: 'rgba(16,185,129,0.12)',
                                color: '#10B981',
                                border: '1px solid rgba(16,185,129,0.2)',
                              }}
                            >
                              <ArrowUpRight size={13} /> Duyệt giao dịch
                            </button>
                            <button
                              onClick={() => handleRejectWd(w.id)}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-85"
                              style={{
                                backgroundColor: 'rgba(239,68,68,0.12)',
                                color: '#EF4444',
                                border: '1px solid rgba(239,68,68,0.2)',
                              }}
                            >
                              <XCircle size={13} /> Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Withdrawal Pagination */}
              {filteredWithdrawals.length > 0 && (
                <div
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl"
                  style={CARD}
                >
                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: '#8892a0' }}
                  >
                    <span>
                      Hiển thị{' '}
                      <strong style={{ color: '#fff' }}>
                        {(wdPage - 1) * wdPageSize + 1} -{' '}
                        {Math.min(
                          wdPage * wdPageSize,
                          filteredWithdrawals.length,
                        )}
                      </strong>{' '}
                      trên tổng số{' '}
                      <strong style={{ color: '#fff' }}>
                        {filteredWithdrawals.length}
                      </strong>{' '}
                      yêu cầu
                    </span>
                    <select
                      value={wdPageSize}
                      onChange={(e) => {
                        setWdPageSize(Number(e.target.value));
                        setWdPage(1);
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer"
                      style={{
                        backgroundColor: '#141e35',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      }}
                    >
                      <option value={5}>5 / trang</option>
                      <option value={10}>10 / trang</option>
                      <option value={20}>20 / trang</option>
                    </select>
                  </div>

                  <Pagination
                    currentPage={wdPage}
                    totalPages={wdTotalPages}
                    onPageChange={setWdPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation modal for Withdrawal Approvals */}
      {confirmWdModal.isOpen && confirmWdModal.withdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4 border border-white/10"
            style={{ backgroundColor: '#0d1629' }}
          >
            <div className="flex items-center gap-2 text-yellow-500 font-bold">
              <AlertTriangle size={20} />
              <span>Xác nhận giao dịch thủ công</span>
            </div>

            <div className="space-y-3 text-sm text-[#c8d0e0]">
              <p>
                Để duyệt yêu cầu rút tiền này, bạn cần thực hiện chuyển khoản
                thủ công bên ngoài hệ thống cho người dùng:
              </p>
              <div className="bg-white/5 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8892a0]">Chủ tài khoản:</span>
                  <span className="font-bold text-white uppercase">
                    {confirmWdModal.withdrawal.accountName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8892a0]">Số tài khoản:</span>
                  <span className="font-bold text-white font-mono">
                    {confirmWdModal.withdrawal.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8892a0]">Ngân hàng:</span>
                  <span className="font-semibold text-white">
                    {confirmWdModal.withdrawal.bankName}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                  <span className="text-[#8892a0] font-semibold">Số tiền:</span>
                  <span className="font-bold text-[#10B981] text-sm">
                    {formatCurrency(confirmWdModal.withdrawal.amount)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-yellow-400 font-medium">
                * Vui lòng chỉ xác nhận sau khi bạn đã hoàn tất giao dịch ngân
                hàng thật. Hệ thống sẽ gửi email báo thành công cho người dùng.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setConfirmWdModal({ isOpen: false, withdrawal: null })
                }
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#8892a0] hover:text-white transition-colors border border-white/10"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmApproveWd}
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#10B981' }}
              >
                Đã chuyển & Duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
