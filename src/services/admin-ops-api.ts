import { Api } from './axios';
import { localStorageService } from './local-storage-service';
import { localStorageKey } from '@/constants/local-storage';

export interface DockLoadItem {
  dockName: string;
  toursInWindow: number;
  maxBoats: number;
  utilizationPercent: number;
  windowLabel: string;
}

export interface AlertItem {
  severity: 'warning' | 'info' | 'critical' | string;
  title: string;
  detail?: string;
}

export interface OpsBriefingSignals {
  toursToday: number;
  guestsExpected: number;
  revenueForecast: number;
  boatsInMaintenance: number;
  pendingOwnerVerifications: number;
  pendingTourApprovals: number;
  dockPeaks: DockLoadItem[];
  alerts: AlertItem[];
  weatherSummary?: string;
}

export interface OpsBriefingResponse {
  generatedAt: string;
  narrative: string;
  signals: OpsBriefingSignals;
}

export interface AdminOpsChatResponse {
  conversationId: string;
  answer: string;
}

interface Envelope<T> {
  code: number;
  result: T;
}

export async function streamAdminChat(
  question: string,
  conversationId: string | undefined,
  onDelta: (delta: string) => void,
  onDone: () => void,
  signal?: AbortSignal,
): Promise<void> {
  const baseUrl =
    (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
      .VITE_API_URL || 'https://localhost:7161';
  // Token được lưu qua JSON.stringify — đọc thô sẽ dính dấu nháy và làm hỏng header Bearer.
  const token = localStorageService.getItem<string>(
    localStorageKey.ACCESS_TOKEN,
  );
  const res = await fetch(`${baseUrl}/api/admin/ops/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question, conversationId: conversationId ?? null }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload) continue;
      try {
        const parsed = JSON.parse(payload) as {
          delta?: string;
          done?: boolean;
        };
        if (parsed.done) {
          onDone();
        } else if (parsed.delta) {
          onDelta(parsed.delta);
        }
      } catch {
        // ignore
      }
    }
  }
  onDone();
}

export interface WhatIfSimRequest {
  scenario: 'close_dock' | 'bad_weather' | 'add_boats';
  dockId?: string;
  startDate?: string;
  endDate?: string;
  number?: number;
}

export interface WhatIfSimResponse {
  scenario: string;
  summary: string;
  affectedBookings: number;
  affectedGuests: number;
  potentialRefundVnd: number;
  suggestions: AlertItem[];
}

export const adminOpsApi = {
  getBriefing: () =>
    Api.get<Envelope<OpsBriefingResponse>>('/admin/ops/briefing').then(
      (r) => r.data.result,
    ),
  ask: (question: string, conversationId?: string) =>
    Api.post<Envelope<AdminOpsChatResponse>>('/admin/ops/chat', {
      question,
      conversationId: conversationId ?? null,
    }).then((r) => r.data.result),
  simulate: (req: WhatIfSimRequest) =>
    Api.post<Envelope<WhatIfSimResponse>>('/admin/ops/simulate', req).then(
      (r) => r.data.result,
    ),
  listDocks: () =>
    Api.get<Envelope<Array<{ id: string; name: string; maxBoats: number }>>>(
      '/admin/docks',
    ).then((r) => r.data.result),
};
