import { useState } from 'react';
import { Bell, Plus, Send, Users, User, CheckCircle } from 'lucide-react';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

const SENT = [
  {
    id: 1,
    title: 'Bảo trì hệ thống định kỳ',
    body: 'Hệ thống sẽ bảo trì từ 2:00 – 4:00 sáng ngày 27/05/2026.',
    type: 'system',
    recipients: 2847,
    sentAt: '26/05/2026 08:00',
    read: 1923,
  },
  {
    id: 2,
    title: 'Khuyến mãi SUMMER26 sắp hết hạn',
    body: 'Mã SUMMER26 sẽ hết hiệu lực vào 31/08/2026. Hãy sử dụng ngay!',
    type: 'promo',
    recipients: 1456,
    sentAt: '25/05/2026 09:30',
    read: 987,
  },
  {
    id: 3,
    title: 'Cập nhật chính sách hủy tour',
    body: 'Chính sách hủy tour có thay đổi từ ngày 01/06/2026.',
    type: 'system',
    recipients: 2847,
    sentAt: '20/05/2026 10:00',
    read: 2341,
  },
];

export default function AdminNotifications() {
  const [showForm, setShowForm] = useState(false);
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [form, setForm] = useState({ title: '', body: '', userId: '' });

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            Thông báo hệ thống
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
            Gửi thông báo quan trọng đến người dùng trên toàn nền tảng
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={16} /> Tạo thông báo
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Đã gửi hôm nay',
            value: '3',
            color: ACCENT,
            bg: 'rgba(255,56,92,0.12)',
          },
          {
            label: 'Tổng người nhận',
            value: '2,847',
            color: '#10B981',
            bg: 'rgba(16,185,129,0.12)',
          },
          {
            label: 'Tỷ lệ đọc TB',
            value: '78%',
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.12)',
          },
          {
            label: 'Thông báo tháng này',
            value: SENT.length,
            color: '#8B5CF6',
            bg: 'rgba(139,92,246,0.12)',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={CARD}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: s.bg }}
            >
              <Bell size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: '#fff' }}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: '#8892a0' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 space-y-4" style={CARD}>
          <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
            Soạn thông báo mới
          </h2>
          <div className="flex gap-3">
            {[
              { v: 'all' as const, label: 'Tất cả người dùng', icon: Users },
              { v: 'specific' as const, label: 'Người cụ thể', icon: User },
            ].map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                onClick={() => setTargetType(v)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold flex-1 justify-center transition-all"
                style={
                  targetType === v
                    ? {
                        backgroundColor: 'rgba(255,56,92,0.12)',
                        color: ACCENT,
                        border: `1px solid ${ACCENT}40`,
                      }
                    : {
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: '#8892a0',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }
                }
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
          {targetType === 'specific' && (
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: '#8892a0' }}
              >
                ID / Email người dùng
              </label>
              <input
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                placeholder="Nhập email..."
                className="w-full rounded-xl py-2.5 px-4 text-sm outline-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              />
            </div>
          )}
          {[
            { label: 'Tiêu đề', key: 'title', placeholder: 'Nhập tiêu đề...' },
            { label: 'Nội dung', key: 'body', placeholder: 'Nhập nội dung...' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: '#8892a0' }}
              >
                {label}
              </label>
              {key === 'body' ? (
                <textarea
                  rows={3}
                  value={form[key as 'body']}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full rounded-xl py-2.5 px-4 text-sm outline-none resize-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
              ) : (
                <input
                  value={form[key as 'title']}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full rounded-xl py-2.5 px-4 text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
              )}
            </div>
          ))}
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              <Send size={14} /> Gửi ngay
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-white/5"
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

      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
            Lịch sử gửi
          </h2>
        </div>
        {SENT.map((n) => {
          const pct = Math.round((n.read / n.recipients) * 100);
          return (
            <div
              key={n.id}
              className="px-6 py-4 border-b last:border-0 hover:bg-white/2 transition-colors space-y-3"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                    style={{
                      backgroundColor:
                        n.type === 'system'
                          ? 'rgba(255,56,92,0.1)'
                          : 'rgba(139,92,246,0.1)',
                    }}
                  >
                    <Bell
                      size={15}
                      style={{
                        color: n.type === 'system' ? ACCENT : '#8B5CF6',
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className="font-semibold text-sm"
                        style={{ color: '#fff' }}
                      >
                        {n.title}
                      </p>
                      <span
                        className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                        style={
                          n.type === 'system'
                            ? {
                                backgroundColor: 'rgba(255,56,92,0.1)',
                                color: ACCENT,
                              }
                            : {
                                backgroundColor: 'rgba(139,92,246,0.1)',
                                color: '#8B5CF6',
                              }
                        }
                      >
                        {n.type === 'system' ? 'System' : 'Promo'}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#8892a0' }}>
                      {n.body}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: '#8892a0' }}>
                    {n.sentAt}
                  </p>
                  <p
                    className="text-xs mt-0.5 flex items-center gap-1 justify-end"
                    style={{ color: '#10B981' }}
                  >
                    <Users size={10} /> {n.recipients.toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#8892a0' }}>
                    <CheckCircle
                      size={10}
                      className="inline mr-1"
                      style={{ color: '#10B981' }}
                    />
                    {n.read.toLocaleString()} / {n.recipients.toLocaleString()}{' '}
                    đã đọc
                  </span>
                  <span className="font-semibold" style={{ color: '#10B981' }}>
                    {pct}%
                  </span>
                </div>
                <div
                  className="h-1 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="h-1 rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: '#10B981' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
