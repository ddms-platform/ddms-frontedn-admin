import { useState } from 'react';
import { Search, ScrollText, Filter } from 'lucide-react';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

type Action = 'INSERT' | 'UPDATE' | 'DELETE';

const LOGS = [
  {
    id: 1,
    action: 'UPDATE' as Action,
    table: 'owner_profiles',
    recordId: 'OP-0091',
    actor: 'admin@ddms.vn',
    oldVal: '{"is_verified":false}',
    newVal: '{"is_verified":true,"verified_at":"2026-05-26"}',
    ts: '26/05/2026 10:42:13',
  },
  {
    id: 2,
    action: 'INSERT' as Action,
    table: 'promotions',
    recordId: 'PROMO-017',
    actor: 'admin@ddms.vn',
    oldVal: null,
    newVal: '{"code":"SUMMER26","value":15}',
    ts: '26/05/2026 09:15:07',
  },
  {
    id: 3,
    action: 'DELETE' as Action,
    table: 'reviews',
    recordId: 'REV-2234',
    actor: 'admin@ddms.vn',
    oldVal: '{"rating":1,"comment":"..."}',
    newVal: null,
    ts: '25/05/2026 16:30:22',
  },
  {
    id: 4,
    action: 'UPDATE' as Action,
    table: 'users',
    recordId: 'USR-1042',
    actor: 'admin@ddms.vn',
    oldVal: '{"roles":["user"]}',
    newVal: '{"roles":["user","owner"]}',
    ts: '25/05/2026 14:05:19',
  },
  {
    id: 5,
    action: 'INSERT' as Action,
    table: 'docks',
    recordId: 'DOCK-013',
    actor: 'admin@ddms.vn',
    oldVal: null,
    newVal: '{"name":"Bến Phú Quốc","max_boats":25}',
    ts: '24/05/2026 11:22:44',
  },
  {
    id: 6,
    action: 'DELETE' as Action,
    table: 'promotions',
    recordId: 'PROMO-012',
    actor: 'admin@ddms.vn',
    oldVal: '{"code":"EXPIRED20"}',
    newVal: null,
    ts: '24/05/2026 09:00:01',
  },
  {
    id: 7,
    action: 'UPDATE' as Action,
    table: 'docks',
    recordId: 'DOCK-003',
    actor: 'admin@ddms.vn',
    oldVal: '{"max_boats":20}',
    newVal: '{"max_boats":30}',
    ts: '23/05/2026 15:44:31',
  },
  {
    id: 8,
    action: 'UPDATE' as Action,
    table: 'owner_profiles',
    recordId: 'OP-0088',
    actor: 'admin@ddms.vn',
    oldVal: '{"is_verified":false}',
    newVal: '{"is_verified":true}',
    ts: '22/05/2026 13:12:09',
  },
];

const ACTION_MAP: Record<Action, { color: string; bg: string }> = {
  INSERT: { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  UPDATE: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  DELETE: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const TABLES = [
  'Tất cả',
  'owner_profiles',
  'promotions',
  'reviews',
  'users',
  'docks',
];

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | Action>('all');
  const [tableFilter, setTableFilter] = useState('Tất cả');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = LOGS.filter((l) => {
    const matchSearch =
      l.table.includes(search) ||
      l.actor.includes(search) ||
      l.recordId.includes(search);
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    const matchTable = tableFilter === 'Tất cả' || l.table === tableFilter;
    return matchSearch && matchAction && matchTable;
  });

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: '#fff', letterSpacing: '-0.44px' }}
        >
          Nhật ký Kiểm toán
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
          Theo dõi mọi thay đổi dữ liệu quan trọng trong hệ thống
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(['INSERT', 'UPDATE', 'DELETE'] as Action[]).map((a) => {
          const info = ACTION_MAP[a];
          const count = LOGS.filter((l) => l.action === a).length;
          return (
            <div
              key={a}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={CARD}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ backgroundColor: info.bg }}
              >
                <ScrollText size={18} style={{ color: info.color }} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: '#fff' }}>
                  {count}
                </p>
                <p className="text-xs font-mono" style={{ color: info.color }}>
                  {a}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#8892a0' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo bảng, actor, record ID..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
            style={{
              backgroundColor: '#0d1629',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: '#8892a0' }}
          >
            <Filter size={13} /> Hành động:
          </div>
          {(['all', 'INSERT', 'UPDATE', 'DELETE'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setActionFilter(a)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                actionFilter === a
                  ? {
                      backgroundColor:
                        a === 'all' ? ACCENT : (ACTION_MAP[a]?.bg ?? ACCENT),
                      color:
                        a === 'all' ? '#fff' : (ACTION_MAP[a]?.color ?? '#fff'),
                      border: 'none',
                    }
                  : {
                      backgroundColor: '#0d1629',
                      color: '#8892a0',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {a === 'all' ? 'Tất cả' : a}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: '#8892a0' }}
          >
            <Filter size={13} /> Bảng:
          </div>
          {TABLES.map((t) => (
            <button
              key={t}
              onClick={() => setTableFilter(t)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                tableFilter === t
                  ? { backgroundColor: ACCENT, color: '#fff' }
                  : {
                      backgroundColor: '#0d1629',
                      color: '#8892a0',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Log table */}
      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {[
                  'Hành động',
                  'Bảng',
                  'Record ID',
                  'Thực hiện bởi',
                  'Thời gian',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8892a0' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const info = ACTION_MAP[log.action];
                return (
                  <>
                    <tr
                      key={log.id}
                      className="border-b hover:bg-white/2 transition-colors cursor-pointer"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                      onClick={() =>
                        setExpanded(expanded === log.id ? null : log.id)
                      }
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className="rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                          style={{
                            backgroundColor: info.bg,
                            color: info.color,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 font-mono text-xs"
                        style={{ color: '#c8d0e0' }}
                      >
                        {log.table}
                      </td>
                      <td
                        className="px-5 py-3.5 font-mono text-xs"
                        style={{ color: '#8892a0' }}
                      >
                        {log.recordId}
                      </td>
                      <td
                        className="px-5 py-3.5 text-xs"
                        style={{ color: '#8892a0' }}
                      >
                        {log.actor}
                      </td>
                      <td
                        className="px-5 py-3.5 text-xs"
                        style={{ color: '#8892a0' }}
                      >
                        {log.ts}
                      </td>
                      <td
                        className="px-5 py-3.5 text-xs"
                        style={{ color: ACCENT }}
                      >
                        {expanded === log.id ? '▲ Ẩn' : '▼ Chi tiết'}
                      </td>
                    </tr>
                    {expanded === log.id && (
                      <tr
                        key={`${log.id}-detail`}
                        style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      >
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            {log.oldVal && (
                              <div>
                                <p
                                  className="text-xs font-semibold mb-1.5"
                                  style={{ color: '#EF4444' }}
                                >
                                  Giá trị cũ (old_data)
                                </p>
                                <pre
                                  className="text-xs rounded-lg p-3 overflow-x-auto"
                                  style={{
                                    backgroundColor: 'rgba(239,68,68,0.06)',
                                    color: '#fca5a5',
                                    border: '1px solid rgba(239,68,68,0.15)',
                                  }}
                                >
                                  {JSON.stringify(
                                    JSON.parse(log.oldVal),
                                    null,
                                    2,
                                  )}
                                </pre>
                              </div>
                            )}
                            {log.newVal && (
                              <div>
                                <p
                                  className="text-xs font-semibold mb-1.5"
                                  style={{ color: '#10B981' }}
                                >
                                  Giá trị mới (new_data)
                                </p>
                                <pre
                                  className="text-xs rounded-lg p-3 overflow-x-auto"
                                  style={{
                                    backgroundColor: 'rgba(16,185,129,0.06)',
                                    color: '#6ee7b7',
                                    border: '1px solid rgba(16,185,129,0.15)',
                                  }}
                                >
                                  {JSON.stringify(
                                    JSON.parse(log.newVal),
                                    null,
                                    2,
                                  )}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-sm" style={{ color: '#8892a0' }}>
            Không có log nào phù hợp
          </p>
        )}
      </div>
    </div>
  );
}
