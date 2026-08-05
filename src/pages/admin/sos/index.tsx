import { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  Anchor,
  User,
  Phone,
  MapPin,
  Radio,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import {
  sosService,
  type SosAlert,
  type PagedResult,
} from '@/services/sosService';
import { sosSignalRService } from '@/services/sosSignalRService';

export default function AdminSosPage() {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    'ALL' | 'ACTIVE' | 'RESOLVED'
  >('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteAlert, setConfirmDeleteAlert] = useState<SosAlert | null>(
    null,
  );

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [paginationMeta, setPaginationMeta] = useState({
    totalItems: 0,
    totalPages: 1,
  });

  const fetchAlerts = useCallback(
    async (
      currentPage = page,
      currentSize = pageSize,
      currentFilter = filterStatus,
    ) => {
      setLoading(true);
      try {
        const data: PagedResult<SosAlert> = await sosService.getPagedAlerts(
          currentPage,
          currentSize,
          currentFilter,
        );
        setAlerts(data.items);
        setPaginationMeta({
          totalItems: data.totalItems,
          totalPages: Math.max(1, data.totalPages),
        });
      } catch (err) {
        console.warn('Could not load SOS alerts:', err);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, filterStatus],
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    sosService
      .getPagedAlerts(page, pageSize, filterStatus)
      .then((data) => {
        if (isMounted) {
          setAlerts(data.items);
          setPaginationMeta({
            totalItems: data.totalItems,
            totalPages: Math.max(1, data.totalPages),
          });
        }
      })
      .catch((err) => {
        console.warn('Could not load SOS alerts:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, filterStatus]);

  useEffect(() => {
    let unsubReceive: (() => void) | undefined;
    let unsubResolve: (() => void) | undefined;

    const setupSignalR = async () => {
      await sosSignalRService.startConnection();

      unsubReceive = sosSignalRService.onReceiveSosAlert((newAlert) => {
        console.log(
          '🔴 Real-time SOS alert received on AdminSosPage:',
          newAlert,
        );
        setAlerts((prev) => [
          newAlert,
          ...prev.filter((a) => a.id !== newAlert.id),
        ]);
        setPaginationMeta((prev) => ({
          ...prev,
          totalItems: prev.totalItems + 1,
        }));
      });

      unsubResolve = sosSignalRService.onSosAlertResolved((sosId) => {
        console.log('🟢 Real-time SOS alert resolved on AdminSosPage:', sosId);
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === sosId
              ? {
                  ...a,
                  status: 'RESOLVED',
                  resolved_at: new Date().toISOString(),
                }
              : a,
          ),
        );
      });
    };

    setupSignalR();

    return () => {
      if (unsubReceive) unsubReceive();
      if (unsubResolve) unsubResolve();
    };
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await sosService.resolveSos(
        id,
        'Đã cử lực lượng Cảng vụ ứng cứu kịp thời',
      );
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: 'RESOLVED',
                resolved_at: new Date().toISOString(),
              }
            : a,
        ),
      );
    } catch (err) {
      console.error('Failed to resolve SOS alert:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteAlert) return;
    const id = confirmDeleteAlert.id;
    setDeletingId(id);
    try {
      await sosService.deleteSos(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setPaginationMeta((prev) => ({
        ...prev,
        totalItems: Math.max(0, prev.totalItems - 1),
      }));
      setConfirmDeleteAlert(null);
    } catch (err) {
      console.error('Failed to delete SOS alert:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div
      className="p-6 lg:p-8 space-y-8 min-h-screen text-slate-100"
      style={{ backgroundColor: '#060f1e' }}
    >
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-red-600/20 border border-red-500/40 rounded-2xl animate-pulse">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Trung Tâm Quản Lý Ứng Cứu SOS
              {activeCount > 0 && (
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold animate-bounce">
                  {activeCount} CẦN CỨU HỘ
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Hệ thống giám sát tín hiệu vị trí GPS và tình huống nguy cấp trên
              biển thời gian thực
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchAlerts(page, pageSize, filterStatus)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Filter Tabs & Page Size Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => {
              setFilterStatus('ALL');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả tín hiệu ({paginationMeta.totalItems})
          </button>
          <button
            onClick={() => {
              setFilterStatus('ACTIVE');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              filterStatus === 'ACTIVE'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Chưa xử lý</span>
          </button>
          <button
            onClick={() => {
              setFilterStatus('RESOLVED');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đã xử lý
          </button>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-red-500"
          >
            <option value={6}>6 phần tử / trang</option>
            <option value={12}>12 phần tử / trang</option>
            <option value={24}>24 phần tử / trang</option>
          </select>
        </div>
      </div>

      {/* SOS Alerts Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-10 h-10 mx-auto animate-spin text-red-500" />
          <p className="text-sm font-medium">
            Đang kết nối tải dữ liệu tín hiệu SOS...
          </p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-16 bg-slate-900/40 rounded-3xl border border-slate-800 text-center text-slate-400 space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
          <h4 className="font-bold text-white text-base">
            Hiện không có bản ghi SOS nào
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Tất cả dữ liệu báo động được đồng bộ trực tiếp từ Database. Khi
            Thuyền trưởng phát tín hiệu SOS, thông tin sẽ ngay lập tức tự động
            hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => {
            const isActive = alert.status === 'ACTIVE';
            const mapsUrl = `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`;

            return (
              <div
                key={alert.id}
                className={`relative rounded-3xl p-6 transition-all duration-300 border flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-b from-red-950/40 to-slate-900 border-red-500/60 shadow-2xl shadow-red-900/20'
                    : 'bg-slate-900/60 border-slate-800 opacity-90'
                }`}
              >
                <div>
                  {/* Top Status & Delete Button */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-red-600/30 text-red-400 border border-red-500/50 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {isActive ? (
                        <Radio className="w-3.5 h-3.5 animate-ping" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isActive
                          ? 'CẤP BÁCH - CHƯA XỬ LÝ'
                          : 'ĐÃ ĐIỀU ĐỘNG CỨU HỘ'}
                      </span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(alert.created_at).toLocaleTimeString('vi-VN')}
                      </span>

                      {/* Trash Delete Button */}
                      <button
                        onClick={() => setConfirmDeleteAlert(alert)}
                        title="Xóa bản ghi SOS"
                        className="p-1.5 bg-slate-800/80 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition border border-slate-700 hover:border-red-500/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-200">
                      <User className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-bold">
                        {alert.user_name || 'Thuyền trưởng'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-200">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs">
                        {alert.user_phone || 'Chưa cập nhật SĐT'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-200">
                      <Anchor className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-xs font-medium">
                        {alert.boat_name || 'Tàu du lịch'} (
                        {alert.registration_number || 'SỐ HIỆU ĐN'})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-rose-300 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/20">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                      <span className="text-xs font-mono font-bold">
                        {alert.latitude.toFixed(5)},{' '}
                        {alert.longitude.toFixed(5)}
                      </span>
                    </div>

                    {alert.note && (
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                        <span className="text-red-400 font-bold">Mô tả: </span>
                        {alert.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-cyan-500/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở Maps</span>
                  </a>

                  {isActive && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolvingId === alert.id}
                      className="flex-1 py-2.5 px-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>
                        {resolvingId === alert.id
                          ? 'Đang xử lý...'
                          : 'Xác Nhận Đã Cứu Hộ'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination Bar ── */}
      {paginationMeta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Hiển thị Trang <strong className="text-white">{page}</strong> /{' '}
            {paginationMeta.totalPages} ({paginationMeta.totalItems} bản ghi)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from(
              { length: paginationMeta.totalPages },
              (_, i) => i + 1,
            ).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                  page === pNum
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              onClick={() =>
                setPage((p) => Math.min(paginationMeta.totalPages, p + 1))
              }
              disabled={page === paginationMeta.totalPages}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDeleteAlert && (
        <div className="fixed inset-0 z-999999 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />
              </div>
              <h3 className="font-extrabold text-white text-lg">
                Xác nhận xóa tín hiệu SOS
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              Bạn có chắc chắn muốn xóa vĩnh viễn bản ghi tín hiệu SOS này khỏi
              Database? Hành động này không thể hoàn tác.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteAlert(null)}
                disabled={deletingId === confirmDeleteAlert.id}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === confirmDeleteAlert.id}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {deletingId === confirmDeleteAlert.id
                    ? 'Đang xóa...'
                    : 'Xóa bản ghi'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
