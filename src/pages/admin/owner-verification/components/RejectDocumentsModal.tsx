import { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  ShieldX,
  FileText,
  CheckSquare,
  Square,
  Loader2,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { Api } from '@/services/axios';
import type { OwnerDocumentListItem } from '@/services/certificate-api';

interface OwnerDataForReject {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  entityType?: string;
  documents?: OwnerDocumentListItem[];
}

interface RejectDocumentsModalProps {
  owner: OwnerDataForReject | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentTypeLabel: (code: string) => string;
}

const QUICK_REASONS = [
  'Hình ảnh chụp bị mờ, mất góc, không đọc được thông tin.',
  'Giấy phép đã hết hạn hiệu lực theo quy định.',
  'Tên người đại diện không trùng khớp với thông tin đăng ký.',
  'Thiếu con dấu đỏ hoặc chữ ký của cơ quan thẩm quyền.',
  'Tài liệu bị thiếu trang hoặc không đúng định dạng quy định.',
];

export default function RejectDocumentsModal({
  owner,
  isOpen,
  onClose,
  onSuccess,
  documentTypeLabel,
}: RejectDocumentsModalProps) {
  const [reason, setReason] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (owner && isOpen) {
      const allTypes = (owner.documents || []).map((d) => d.documentType);
      setSelectedTypes(allTypes);
      setReason('');
    }
  }, [owner, isOpen]);

  if (!isOpen || !owner) return null;

  const docs = owner.documents || [];

  const handleToggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSelectAll = () => {
    setSelectedTypes(docs.map((d) => d.documentType));
  };

  const handleDeselectAll = () => {
    setSelectedTypes([]);
  };

  const handleQuickReason = (preset: string) => {
    if (!reason.trim()) {
      setReason(preset);
    } else if (!reason.includes(preset)) {
      setReason((prev) => `${prev.trim()}\n- ${preset}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.error('Vui lòng nhập lý do từ chối hồ sơ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: { reason: string; documentTypes?: string[] } = {
        reason: trimmedReason,
      };

      if (selectedTypes.length > 0 && selectedTypes.length < docs.length) {
        payload.documentTypes = selectedTypes;
      }

      const res = await Api.post(
        `/admin/owners/verifications/${owner.id}/reject-documents`,
        payload,
      );

      if (res.status === 200) {
        toast.success(
          'Đã gửi thông báo từ chối hồ sơ pháp lý đến chủ thuyền thành công!',
        );
        onSuccess();
        onClose();
      } else {
        toast.error('Có lỗi xảy ra khi từ chối hồ sơ pháp lý.');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message;
      toast.error(msg || 'Có lỗi xảy ra khi từ chối hồ sơ pháp lý.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#0d1629',
          borderColor: 'rgba(239,68,68,0.3)',
          boxShadow: '0 25px 50px -12px rgba(239,68,68,0.15)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldX size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Từ chối hồ sơ pháp lý chủ thuyền
              </h3>
              <p className="text-xs text-rose-300/80">
                Gửi phản hồi yêu cầu chủ thuyền chỉnh sửa & nộp lại
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-5 overflow-y-auto max-h-[calc(85vh-140px)]"
        >
          {/* Owner Info Summary Card */}
          <div className="rounded-xl p-3.5 bg-white/5 border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">{owner.name}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-medium text-[11px]">
                {owner.owner}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 border-t border-white/5">
              <span className="flex items-center gap-1.5 truncate">
                <Mail size={12} className="text-slate-500 shrink-0" />
                {owner.email || 'N/A'}
              </span>
              <span className="flex items-center gap-1.5 truncate">
                <Phone size={12} className="text-slate-500 shrink-0" />
                {owner.phone || 'N/A'}
              </span>
            </div>
          </div>

          {/* Document selection */}
          {docs.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText size={13} className="text-rose-400" />
                  Chọn giấy tờ cần từ chối ({selectedTypes.length}/{docs.length}
                  ):
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-slate-400 hover:underline"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {docs.map((doc) => {
                  const isChecked = selectedTypes.includes(doc.documentType);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleToggleType(doc.documentType)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare
                          size={15}
                          className="text-rose-400 shrink-0"
                        />
                      ) : (
                        <Square size={15} className="text-slate-500 shrink-0" />
                      )}
                      <span className="truncate font-medium">
                        {documentTypeLabel(doc.documentType)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick preset reasons */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Gợi ý lý do nhanh:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickReason(preset)}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-200 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reason textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <AlertTriangle size={13} />
                Lý do từ chối chi tiết (Bắt buộc) *
              </label>
              <span className="text-[11px] text-slate-400">
                {reason.length} ký tự
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết để chủ thuyền nắm rõ thông tin và cập nhật lại chính xác..."
              className="w-full rounded-xl bg-slate-900/90 border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none"
            />
          </div>

          {/* Warning banner */}
          <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2.5">
            <AlertTriangle
              size={15}
              className="text-amber-400 shrink-0 mt-0.5"
            />
            <p className="leading-relaxed">
              Sau khi từ chối, hệ thống sẽ gửi thông báo đến tài khoản chủ
              thuyền và hiển thị ghi chú lý do trên trang nộp giấy tờ. Chủ
              thuyền cần tải lên lại giấy tờ mới để gửi Ban quản trị xét duyệt
              lại.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShieldX size={14} />
                  Xác nhận từ chối & Gửi thông báo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
