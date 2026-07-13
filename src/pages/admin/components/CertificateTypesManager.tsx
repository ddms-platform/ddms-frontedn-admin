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
import { useTranslation } from 'react-i18next';
import {
  certificateApi,
  CERTIFICATE_SCOPE_LABELS,
  type CertificateScope,
  type CertificateTypeItem,
  type CreateCertificateTypeRequest,
  type UpdateCertificateTypeRequest,
} from '@/services/certificate-api';

const ACCENT = '#FF385C';

type ScopeFilter = 'all' | CertificateScope;

type FormState = {
  code: string;
  nameVi: string;
  nameEn: string;
  scope: CertificateScope;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  code: '',
  nameVi: '',
  nameEn: '',
  scope: 'boat',
  sortOrder: '',
  isActive: true,
});

function normalizeScope(scope?: string | null): CertificateScope {
  return scope === 'owner' ? 'owner' : 'boat';
}

export default function CertificateTypesManager() {
  const { t } = useTranslation();
  const [types, setTypes] = useState<CertificateTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CertificateTypeItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');

  const fetchTypes = (scope: ScopeFilter = scopeFilter) => {
    setLoading(true);
    certificateApi
      .getTypes(scope === 'all' ? undefined : scope)
      .then((res) => {
        if (res.status === 200 && res.data?.code === 1000) {
          setTypes(res.data.result || []);
        }
      })
      .catch(() => toast.error(t('certificateTypesManager.loadError')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTypes(scopeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeFilter]);

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({
      ...emptyForm(),
      scope: scopeFilter === 'owner' ? 'owner' : 'boat',
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
      scope: normalizeScope(item.scope),
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
      toast.error(t('certificateTypesManager.validation.namesRequired'));
      return;
    }
    if (creating && !form.code.trim()) {
      toast.error(t('certificateTypesManager.validation.codeRequired'));
      return;
    }

    setSaving(true);
    try {
      if (creating) {
        const payload: CreateCertificateTypeRequest = {
          code: form.code.trim().toLowerCase(),
          nameVi: form.nameVi.trim(),
          nameEn: form.nameEn.trim(),
          scope: form.scope,
          sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
          isActive: form.isActive,
        };
        const res = await certificateApi.createType(payload);
        if (res.status === 200 && res.data?.code === 1000) {
          toast.success(t('certificateTypesManager.createSuccess'));
          closeForm();
          fetchTypes();
        } else {
          toast.error(t('certificateTypesManager.createError'));
        }
      } else if (editing) {
        const payload: UpdateCertificateTypeRequest = {
          nameVi: form.nameVi.trim(),
          nameEn: form.nameEn.trim(),
          scope: form.scope,
          sortOrder: Number(form.sortOrder) || editing.sortOrder,
          isActive: form.isActive,
        };
        const res = await certificateApi.updateType(editing.id, payload);
        if (res.status === 200 && res.data?.code === 1000) {
          toast.success(t('certificateTypesManager.updateSuccess'));
          closeForm();
          fetchTypes();
        } else {
          toast.error(t('certificateTypesManager.updateError'));
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t('certificateTypesManager.genericError');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CertificateTypeItem) => {
    if (
      !confirm(
        t('certificateTypesManager.deleteConfirm', { name: item.nameVi }),
      )
    ) {
      return;
    }
    setDeletingId(item.id);
    try {
      const res = await certificateApi.deleteType(item.id);
      if (res.status === 200 && res.data?.code === 1000) {
        toast.success(t('certificateTypesManager.deleteSuccess'));
        fetchTypes();
      } else {
        toast.error(t('certificateTypesManager.deleteError'));
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t('certificateTypesManager.genericError');
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const showForm = creating || !!editing;
  const scopeLabel = (scope?: string | null) => {
    const normalized = normalizeScope(scope);
    return t(`certificateTypesManager.scopes.${normalized}`, {
      defaultValue: CERTIFICATE_SCOPE_LABELS[normalized],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#fff' }}>
            {t('certificateTypesManager.title')}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#8892a0' }}>
            {t('certificateTypesManager.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={14} /> {t('certificateTypesManager.add')}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'boat', 'owner'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setScopeFilter(f)}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
            style={
              scopeFilter === f
                ? { backgroundColor: ACCENT, color: '#fff' }
                : {
                    backgroundColor: '#0d1629',
                    color: '#8892a0',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
            }
          >
            {f === 'all'
              ? t('certificateTypesManager.filterAll')
              : scopeLabel(f)}
          </button>
        ))}
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
              {creating
                ? t('certificateTypesManager.formCreate')
                : t('certificateTypesManager.formEdit', {
                    code: editing?.code,
                  })}
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
                  {t('certificateTypesManager.fields.code')}
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
                {t('certificateTypesManager.fields.nameVi')}
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
                {t('certificateTypesManager.fields.nameEn')}
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
                {t('certificateTypesManager.fields.scope')}
              </label>
              <select
                value={form.scope}
                onChange={(e) =>
                  setForm({
                    ...form,
                    scope: e.target.value as CertificateScope,
                  })
                }
                className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              >
                <option value="boat">{scopeLabel('boat')}</option>
                <option value="owner">{scopeLabel('owner')}</option>
              </select>
            </div>
            <div>
              <label
                className="block text-[10px] font-semibold mb-1"
                style={{ color: '#8892a0' }}
              >
                {t('certificateTypesManager.fields.sortOrder')}
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
            <div className="flex items-end sm:col-span-2">
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
                {form.isActive
                  ? t('certificateTypesManager.active')
                  : t('certificateTypesManager.inactive')}
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
              {t('certificateTypesManager.cancel')}
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
              {t('certificateTypesManager.save')}
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
          {t('certificateTypesManager.empty')}
        </p>
      ) : (
        <div
          className="overflow-hidden rounded-xl"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <tr className="text-left">
                {[
                  t('certificateTypesManager.columns.code'),
                  t('certificateTypesManager.columns.nameVi'),
                  t('certificateTypesManager.columns.nameEn'),
                  t('certificateTypesManager.columns.scope'),
                  t('certificateTypesManager.columns.sortOrder'),
                  t('certificateTypesManager.columns.status'),
                  '',
                ].map((h, idx) => (
                  <th
                    key={h || `actions-${idx}`}
                    className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: '#8892a0' }}
                  >
                    {h}
                  </th>
                ))}
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
                  <td className="px-3 py-3">
                    <span
                      className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor:
                          normalizeScope(item.scope) === 'owner'
                            ? 'rgba(59,130,246,0.12)'
                            : 'rgba(16,185,129,0.12)',
                        color:
                          normalizeScope(item.scope) === 'owner'
                            ? '#3B82F6'
                            : '#10B981',
                      }}
                    >
                      {scopeLabel(item.scope)}
                    </span>
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
                      {item.isActive
                        ? t('certificateTypesManager.statusVisible')
                        : t('certificateTypesManager.statusHidden')}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-1.5 hover:bg-white/10"
                        style={{ color: '#3B82F6' }}
                        title={t('certificateTypesManager.edit')}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                        className="rounded-lg p-1.5 hover:bg-red-500/10 disabled:opacity-50"
                        style={{ color: '#EF4444' }}
                        title={t('certificateTypesManager.delete')}
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
