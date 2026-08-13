import { useEffect, useRef, useState } from 'react';
import {
  RefreshCw,
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  AlertTriangle,
  TrendingUp,
  Users,
  Ship,
  DollarSign,
  Cloud,
  Loader2,
  Anchor,
  FlaskConical,
  PlayCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  adminOpsApi,
  streamAdminChat,
  type OpsBriefingResponse,
  type WhatIfSimResponse,
} from '@/services/admin-ops-api';
import {
  adminAlertsSignalR,
  type AdminRealtimeAlert,
} from '@/services/adminAlertsSignalRService';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

interface ChatEntry {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

function severityColor(sev: string) {
  if (sev === 'critical') return { fg: '#EF4444', bg: 'rgba(239,68,68,0.15)' };
  if (sev === 'warning') return { fg: '#F59E0B', bg: 'rgba(245,158,11,0.15)' };
  return { fg: '#38BDF8', bg: 'rgba(56,189,248,0.15)' };
}

function formatMoney(v: number) {
  return new Intl.NumberFormat('vi-VN').format(v);
}

export default function AdminOpsPage() {
  const [briefing, setBriefing] = useState<OpsBriefingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<AdminRealtimeAlert[]>([]);

  // What-if
  const [scenario, setScenario] = useState<
    'close_dock' | 'bad_weather' | 'add_boats'
  >('bad_weather');
  const [scenarioDate, setScenarioDate] = useState<string>(
    new Date(Date.now() + 24 * 3600_000).toISOString().split('T')[0],
  );
  const [scenarioNumber, setScenarioNumber] = useState<number>(5);
  const [scenarioDockId, setScenarioDockId] = useState<string>('');
  const [dockOptions, setDockOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [simResult, setSimResult] = useState<WhatIfSimResponse | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    // Best-effort — swallow if endpoint shape differs
    adminOpsApi
      .listDocks()
      .then((docks) => {
        if (Array.isArray(docks)) {
          setDockOptions(docks.map((d) => ({ id: d.id, name: d.name })));
          if (docks.length > 0) setScenarioDockId(docks[0].id);
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const start = new Date(scenarioDate);
      const end = new Date(start.getTime() + 24 * 3600_000);
      const res = await adminOpsApi.simulate({
        scenario,
        dockId:
          scenario === 'close_dock' ? scenarioDockId || undefined : undefined,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        number: scenario === 'add_boats' ? scenarioNumber : undefined,
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
      toast.error('Simulation lỗi, thử lại.');
    } finally {
      setSimLoading(false);
    }
  };

  // Chat state
  const [chatEntries, setChatEntries] = useState<ChatEntry[]>([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [convId, setConvId] = useState<string | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadBriefing = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await adminOpsApi.getBriefing();
      setBriefing(data);
    } catch (err) {
      console.error(err);
      toast.error('Không tải được briefing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadBriefing();
  }, []);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    void adminAlertsSignalR.startConnection().then(() => {
      unsub = adminAlertsSignalR.onAlert((alert) => {
        setLiveAlerts((prev) => [alert, ...prev].slice(0, 15));
        toast.warning(alert.title, { description: alert.detail });
      });
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatEntries, asking]);

  const suggestedQuestions = [
    'Tháng này doanh thu ra sao so với tháng trước?',
    'Dock nào tuần qua có nhiều tour nhất?',
    'Top 5 tour đang hot nhất hiện tại?',
    'Có bao nhiêu owner đang chờ duyệt?',
    'Tỷ lệ booking huỷ 30 ngày qua có bất thường không?',
  ];

  const handleAsk = async (text?: string) => {
    const q = (text ?? question).trim();
    if (!q || asking) return;
    const aiId = `a-${Date.now()}`;
    setChatEntries((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: q },
      { id: aiId, role: 'ai', text: '' },
    ]);
    setQuestion('');
    setAsking(true);
    try {
      let acc = '';
      await streamAdminChat(
        q,
        convId,
        (delta) => {
          acc += delta;
          setChatEntries((prev) =>
            prev.map((e) => (e.id === aiId ? { ...e, text: acc } : e)),
          );
        },
        () => {
          if (!convId) setConvId(aiId);
        },
      );
    } catch (err) {
      console.error(err);
      toast.error('AI không trả lời được. Thử lại sau.');
      setChatEntries((prev) =>
        prev.map((e) =>
          e.id === aiId ? { ...e, text: 'AI đang bận, thử lại sau.' } : e,
        ),
      );
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            <Sparkles size={22} style={{ color: ACCENT }} />
            Ops Command Center
          </h1>
          <p className="mt-1 max-w-3xl text-sm" style={{ color: '#8892a0' }}>
            AI Analyst tự động tổng hợp tình hình vận hành và trả lời câu hỏi dữ
            liệu tự nhiên bằng tiếng Việt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadBriefing(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ color: '#fff', backgroundColor: ACCENT }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Đang cập nhật...' : 'Làm mới briefing'}
        </button>
      </div>

      {/* What-if simulator */}
      <div className="rounded-2xl p-6 space-y-4" style={CARD}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(168,85,247,0.15)',
              color: '#a855f7',
            }}
          >
            <FlaskConical size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">What-if Simulator</h2>
            <p className="text-[11px]" style={{ color: '#8892a0' }}>
              Mô phỏng tác động của kịch bản trước khi ra quyết định
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as typeof scenario)}
            className="h-10 px-3 rounded-lg text-sm bg-transparent border"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#fff',
              backgroundColor: '#0d1629',
            }}
          >
            <option value="bad_weather">☔ Thời tiết xấu 1 ngày</option>
            <option value="close_dock">🚫 Đóng dock 1 ngày</option>
            <option value="add_boats">➕ Thêm N boat mới</option>
          </select>

          {scenario === 'close_dock' && (
            <select
              value={scenarioDockId}
              onChange={(e) => setScenarioDockId(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm bg-transparent border"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#fff',
                backgroundColor: '#0d1629',
              }}
            >
              {dockOptions.length === 0 && <option>-- Không có dock --</option>}
              {dockOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {scenario === 'add_boats' && (
            <input
              type="number"
              min={1}
              max={100}
              value={scenarioNumber}
              onChange={(e) => setScenarioNumber(Number(e.target.value))}
              className="h-10 px-3 rounded-lg text-sm bg-transparent border"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }}
              placeholder="Số boat mới"
            />
          )}

          {scenario !== 'add_boats' && (
            <input
              type="date"
              value={scenarioDate}
              onChange={(e) => setScenarioDate(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm bg-transparent border"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }}
            />
          )}

          <button
            type="button"
            onClick={runSimulation}
            disabled={simLoading}
            className="h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#a855f7', color: '#fff' }}
          >
            {simLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <PlayCircle size={14} />
            )}
            Chạy mô phỏng
          </button>
        </div>

        {simResult && (
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: 'rgba(168,85,247,0.08)' }}
          >
            <p className="text-sm" style={{ color: '#c8d0e0' }}>
              {simResult.summary}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <KpiTile
                icon={<Users size={14} />}
                label="Booking ảnh hưởng"
                value={simResult.affectedBookings}
                color="#F59E0B"
              />
              <KpiTile
                icon={<Users size={14} />}
                label="Khách ảnh hưởng"
                value={simResult.affectedGuests}
                color="#38BDF8"
              />
              <KpiTile
                icon={<DollarSign size={14} />}
                label="Ước tính refund"
                value={`${formatMoney(simResult.potentialRefundVnd)}đ`}
                color="#EF4444"
              />
            </div>
            {simResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <p
                  className="text-[10px] uppercase font-bold tracking-wider"
                  style={{ color: '#8892a0' }}
                >
                  Đề xuất
                </p>
                {simResult.suggestions.map((s, i) => {
                  const c = severityColor(s.severity);
                  return (
                    <div
                      key={i}
                      className="rounded-lg p-2.5"
                      style={{
                        backgroundColor: c.bg,
                        borderLeft: `3px solid ${c.fg}`,
                      }}
                    >
                      <p
                        className="text-xs font-semibold"
                        style={{ color: c.fg }}
                      >
                        {s.title}
                      </p>
                      {s.detail && (
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: '#c8d0e0' }}
                        >
                          {s.detail}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        {/* ─────────────── Briefing card ─────────────── */}
        <div className="rounded-2xl p-6 space-y-5" style={CARD}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ☀️ Briefing hôm nay
            </h2>
            {briefing && (
              <span className="text-[11px]" style={{ color: '#8892a0' }}>
                {new Date(briefing.generatedAt).toLocaleString('vi-VN')}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: ACCENT }}
              />
            </div>
          ) : briefing ? (
            <>
              {/* KPI grid */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <KpiTile
                  icon={<TrendingUp size={16} />}
                  label="Tour hôm nay"
                  value={briefing.signals.toursToday}
                  color="#10B981"
                />
                <KpiTile
                  icon={<Users size={16} />}
                  label="Khách dự kiến"
                  value={briefing.signals.guestsExpected}
                  color="#38BDF8"
                />
                <KpiTile
                  icon={<DollarSign size={16} />}
                  label="Doanh thu forecast"
                  value={`${formatMoney(briefing.signals.revenueForecast)}đ`}
                  color={ACCENT}
                />
                <KpiTile
                  icon={<Ship size={16} />}
                  label="Boat bảo trì"
                  value={briefing.signals.boatsInMaintenance}
                  color="#F59E0B"
                />
              </div>

              {/* Weather */}
              {briefing.signals.weatherSummary && (
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
                  style={{
                    backgroundColor: 'rgba(56,189,248,0.08)',
                    color: '#38BDF8',
                  }}
                >
                  <Cloud size={16} />
                  <span>
                    Thời tiết Đà Nẵng: {briefing.signals.weatherSummary}
                  </span>
                </div>
              )}

              {/* AI Narrative */}
              <div
                className="rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: '#c8d0e0',
                  fontFamily:
                    'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                {briefing.narrative}
              </div>

              {/* Dock peaks */}
              {briefing.signals.dockPeaks.length > 0 && (
                <div>
                  <h3
                    className="text-xs font-bold uppercase mb-2 tracking-wider flex items-center gap-1"
                    style={{ color: '#8892a0' }}
                  >
                    <Anchor size={12} /> Dock có tải cao
                  </h3>
                  <div className="space-y-2">
                    {briefing.signals.dockPeaks.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg p-3"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {d.dockName}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: '#8892a0' }}
                          >
                            {d.windowLabel} · {d.toursInWindow}/{d.maxBoats}{' '}
                            tour
                          </p>
                        </div>
                        <div
                          className="px-2 py-1 rounded-md text-xs font-bold"
                          style={{
                            color:
                              d.utilizationPercent >= 90
                                ? '#EF4444'
                                : '#F59E0B',
                            backgroundColor:
                              d.utilizationPercent >= 90
                                ? 'rgba(239,68,68,0.12)'
                                : 'rgba(245,158,11,0.12)',
                          }}
                        >
                          {d.utilizationPercent}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Realtime Feed */}
              {liveAlerts.length > 0 && (
                <div>
                  <h3
                    className="text-xs font-bold uppercase mb-2 tracking-wider flex items-center gap-1"
                    style={{ color: '#8892a0' }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    Live feed
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {liveAlerts.map((a, i) => {
                      const c = severityColor(a.severity);
                      return (
                        <div
                          key={i}
                          className="rounded-lg p-2.5"
                          style={{
                            backgroundColor: c.bg,
                            borderLeft: `3px solid ${c.fg}`,
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className="text-xs font-semibold"
                              style={{ color: c.fg }}
                            >
                              {a.title}
                            </p>
                            <span
                              className="text-[9px]"
                              style={{ color: '#8892a0' }}
                            >
                              {new Date(a.createdAt).toLocaleTimeString(
                                'vi-VN',
                              )}
                            </span>
                          </div>
                          {a.detail && (
                            <p
                              className="text-[10px] mt-0.5"
                              style={{ color: '#c8d0e0' }}
                            >
                              {a.detail}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Alerts */}
              {briefing.signals.alerts.length > 0 && (
                <div>
                  <h3
                    className="text-xs font-bold uppercase mb-2 tracking-wider flex items-center gap-1"
                    style={{ color: '#8892a0' }}
                  >
                    <AlertTriangle size={12} /> Cảnh báo
                  </h3>
                  <div className="space-y-2">
                    {briefing.signals.alerts.map((a, i) => {
                      const c = severityColor(a.severity);
                      return (
                        <div
                          key={i}
                          className="rounded-lg p-3"
                          style={{
                            backgroundColor: c.bg,
                            borderLeft: `3px solid ${c.fg}`,
                          }}
                        >
                          <p
                            className="text-sm font-semibold"
                            style={{ color: c.fg }}
                          >
                            {a.title}
                          </p>
                          {a.detail && (
                            <p
                              className="text-[11px] mt-0.5"
                              style={{ color: '#c8d0e0' }}
                            >
                              {a.detail}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-red-400">Không có dữ liệu.</p>
          )}
        </div>

        {/* ─────────────── Admin AI chat card ─────────────── */}
        <div
          className="rounded-2xl flex flex-col"
          style={{ ...CARD, minHeight: 520 }}
        >
          <div
            className="border-b px-6 py-4"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot size={18} style={{ color: ACCENT }} /> Chat với dữ liệu
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: '#8892a0' }}>
              Hỏi tự nhiên — AI truy vấn DB và trả lời bằng số liệu thật.
            </p>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-64 max-h-105">
            {chatEntries.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs" style={{ color: '#8892a0' }}>
                  Gợi ý:
                </p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAsk(q)}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5"
                    style={{
                      color: '#c8d0e0',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px dashed rgba(255,255,255,0.08)',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {chatEntries.map((entry) => (
              <div
                key={entry.id}
                className={`flex gap-2 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {entry.role === 'ai' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: 'rgba(255,56,92,0.15)',
                      color: ACCENT,
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                    entry.role === 'user'
                      ? 'rounded-br-none'
                      : 'rounded-bl-none'
                  }`}
                  style={{
                    backgroundColor:
                      entry.role === 'user' ? ACCENT : 'rgba(255,255,255,0.05)',
                    color: entry.role === 'user' ? '#fff' : '#e5eaf0',
                  }}
                >
                  {entry.text}
                </div>
                {entry.role === 'user' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: 'rgba(56,189,248,0.15)',
                      color: '#38BDF8',
                    }}
                  >
                    <UserIcon size={14} />
                  </div>
                )}
              </div>
            ))}

            {asking && (
              <div className="flex gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'rgba(255,56,92,0.15)',
                    color: ACCENT,
                  }}
                >
                  <Bot size={14} />
                </div>
                <div
                  className="rounded-2xl rounded-bl-none px-3.5 py-2.5 flex items-center gap-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: ACCENT, animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: ACCENT, animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: ACCENT, animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2 border-t p-3"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Hỏi AI bằng ngôn ngữ tự nhiên..."
              disabled={asking}
              className="flex-1 bg-transparent border rounded-xl px-3 py-2 text-sm outline-none disabled:opacity-50"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#fff',
              }}
            />
            <button
              type="submit"
              disabled={!question.trim() || asking}
              className="p-2.5 rounded-xl disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {icon}
        </div>
        <span className="text-[11px]" style={{ color: '#8892a0' }}>
          {label}
        </span>
      </div>
      <p className="text-lg font-bold" style={{ color: '#fff' }}>
        {value}
      </p>
    </div>
  );
}
