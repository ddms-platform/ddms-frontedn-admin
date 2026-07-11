import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  certificateApi,
  type CertificateTypeItem,
  type CreateCertificateTypeRequest,
  type UpdateCertificateTypeRequest,
} from '@/services/certificate-api';

const ACCENT = '#FF385C';

type FormState = {
  code: string;
  nameVi: string;
  nameEn: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  code: '',
  nameVi: '',
  nameEn: '',
  sortOrder: '',
  isActive: true,
});

export default function CertificateTypesManager() {
  const [types, setTypes] = useState<CertificateTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CertificateTypeItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTypes = () => {
    setLoading(true);
    certificateApi
      .getTypes()
      .then((res) => {
        if (res.status === 200 && res.data?.code === 1000) {
          setTypes(res.data.result || []);
        }
      })
      .catch(() => toast.error('Không thể tải danh sách loại giấy tờ'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({
      ...emptyForm(),
      sortOrder: String((types.at(-1)?.sortOrder ?? 0) + 1),
    });
  };

  const openEdit = (item: CertificateTypeItem) => {
    setCreating(false);
    setEditing(item);
    setForm({
      code: item.code,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      sortOrder: String(item.sortOrder),
      isActive: item.isActive,
    });
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (!form.nameVi.trim() || !form.nameEn.trim()) {
      toast.error('Vui lòng nhập tên tiếng Việt và tiếng Anh');
      return;
    }
    if (creating && !form.code.trim()) {
      toast.error('Vui lòng nhập mã loại giấy tờ');
      return;
    }

    setSaving(true);
    try {
      if (creating) {
        const payload: CreateCertificateTypeRequest = {
          code: form.code.trim().toLowerCase(),
          nameVi: form.nameVi.trim(),
          nameEn: form.nameEn.trim(),
          sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
          isActive: form.isActive,
        };
        const res = await certificateApi.createType(payload);
        if (res.status === 200 && res.data?.code === 1000) {
          toast.success('Đã thêm loại giấy tờ');
          closeForm();
          fetchTypes();
        } else {
          toast.error('Không thể thêm loại giấy tờ');
        }
      } else if (editing) {
        const payload: UpdateCertificateTypeRequest = {
          nameVi: form.nameVi.trim(),
          nameEn: form.nameEn.trim(),
          sortOrder: Number(form.sortOrder) || editing.sortOrder,
          isActive: form.isActive,
        };
        const res = await certificateApi.updateType(editing.id, payload);
        if (res.status === 200 && res.data?.code === 1000) {
          toast.success('Đã cập nhật loại giấy tờ');
          closeForm();
          fetchTypes();
        } else {
          toast.error('Không thể cập nhật loại giấy tờ');
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CertificateTypeItem) => {
    if (
      !confirm(
        `Xóa loại "${item.nameVi}"?\nNếu đã có giấy tờ dùng mã này, hệ thống sẽ chỉ vô hiệu hóa.`,
      )
    ) {
      return;
    }
    setDeletingId(item.id);
    try {
      const res = await certificateApi.deleteType(item.id);
      if (res.status === 200 && res.data?.code === 1000) {
        toast.success('Đã xóa / vô hiệu hóa loại giấy tờ');
        fetchTypes();
      } else {
        toast.error('Không thể xóa loại giấy tờ');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const showForm = creating || !!editing;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#fff' }}>
            Danh mục loại giấy tờ
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#8892a0' }}>
            Các loại này hiện trong dropdown khi Owner upload giấy tờ
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={14} /> Thêm loại
        </button>
      </div>

      {showForm && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            backgroundColor: 'rgba(255,56,92,0.06)',
            border: '1px solid rgba(255,56,92,0.2)',
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: ACCENT }}>
              {creating ? 'Thêm loại mới' : `Sửa: ${editing?.code}`}
            </p>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-1 hover:bg-white/10"
              style={{ color: '#8892a0' }}
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {creating && (
              <div className="sm:col-span-2">
                <label
                  className="block text-[10px] font-semibold mb-1"
                  style={{ color: '#8892a0' }}
                >
                  Mã (code) — không đổi sau khi tạo
                </label>
                <input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toLowerCase() })
                  }
                  placeholder="vd: pollution_cert"
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
              </div>
            )}
            <div>
              <label
                className="block text-[10px] font-semibold mb-1"
                style={{ color: '#8892a0' }}
              >
                Tên tiếng Việt
              </label>
              <input
                value={form.nameVi}
                onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-xs outline-none"
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
                Tên tiếng Anh
              </label>
              <input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-xs outline-none"
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
                Thứ tự
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: e.target.value })
                }
                className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: form.isActive
                    ? 'rgba(16,185,129,0.12)'
                    : 'rgba(136,146,160,0.12)',
                  color: form.isActive ? '#10B981' : '#8892a0',
                }}
              >
                {form.isActive ? (
                  <ToggleRight size={16} />
                ) : (
                  <ToggleLeft size={16} />
                )}
                {form.isActive ? 'Đang hiện' : 'Đã ẩn'}
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl px-3 py-2 text-xs font-semibold"
              style={{ color: '#c8d0e0' }}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Lưu
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: '#8892a0' }}
          />
        </div>
      ) : types.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: '#8892a0' }}>
          Chưa có loại giấy tờ nào
        </p>
      ) : (
        <div
          className="overflow-hidden rounded-xl"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <tr className="text-left">
                {['Mã', 'Tên VI', 'Tên EN', 'Thứ tự', 'Trạng thái', ''].map(
                  (h) => (
                    <th
                      key={h || 'actions'}
                      className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: '#8892a0' }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {types.map((item) => (
                <tr
                  key={item.id}
                  className="border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <td
                    className="px-3 py-3 text-xs font-mono"
                    style={{ color: '#c8d0e0' }}
                  >
                    {item.code}
                  </td>
                  <td
                    className="px-3 py-3 text-xs font-semibold"
                    style={{ color: '#fff' }}
                  >
                    {item.nameVi}
                  </td>
                  <td
                    className="px-3 py-3 text-xs"
                    style={{ color: '#c8d0e0' }}
                  >
                    {item.nameEn}
                  </td>
                  <td
                    className="px-3 py-3 text-xs"
                    style={{ color: '#c8d0e0' }}
                  >
                    {item.sortOrder}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: item.isActive
                          ? 'rgba(16,185,129,0.12)'
                          : 'rgba(136,146,160,0.12)',
                        color: item.isActive ? '#10B981' : '#8892a0',
                      }}
                    >
                      {item.isActive ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-1.5 hover:bg-white/10"
                        style={{ color: '#3B82F6' }}
                        title="Sửa"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                        className="rounded-lg p-1.5 hover:bg-red-500/10 disabled:opacity-50"
                        style={{ color: '#EF4444' }}
                        title="Xóa"
                      >
                        {deletingId === item.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
