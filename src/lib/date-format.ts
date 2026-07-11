/** Date helpers: UI uses dd/MM/yyyy, API uses yyyy-MM-dd. */

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DMY_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

export function isoToDmy(iso: string): string {
  if (!iso) return '';
  const m = ISO_RE.exec(iso.slice(0, 10));
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function dmyToIso(dmy: string): string | null {
  const trimmed = dmy.trim();
  if (!trimmed) return '';
  const m = DMY_RE.exec(trimmed);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(year, month - 1, day);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return null;
  }
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/** Auto-insert slashes and clamp day/month while typing: 12722026 → 12/12/2026 */
export function maskDmyInput(raw: string): string {
  let digits = raw.replace(/\D/g, '').slice(0, 8);
  if (!digits) return '';

  // Day: first digit 0-3; if first is 3, second max 1; complete day 01-31
  if (digits.length >= 1) {
    const d1 = Math.min(Number(digits[0]), 3);
    digits = `${d1}${digits.slice(1)}`;
  }
  if (digits.length >= 2) {
    let day = Number(digits.slice(0, 2));
    if (day === 0) day = 1;
    if (day > 31) day = 31;
    digits = `${String(day).padStart(2, '0')}${digits.slice(2)}`;
  }

  // Month: 01-12
  if (digits.length >= 3) {
    const m1 = Math.min(Number(digits[2]), 1);
    digits = `${digits.slice(0, 2)}${m1}${digits.slice(3)}`;
  }
  if (digits.length >= 4) {
    let month = Number(digits.slice(2, 4));
    if (month === 0) month = 1;
    if (month > 12) month = 12;
    digits = `${digits.slice(0, 2)}${String(month).padStart(2, '0')}${digits.slice(4)}`;
  }

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function formatDisplayDate(value?: string | null): string {
  if (!value) return '—';
  const iso = ISO_RE.exec(value.slice(0, 10));
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return value;
}

export function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse yyyy-MM-dd as a local Date (no UTC shift). */
export function isoToLocalDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const m = ISO_RE.exec(iso.slice(0, 10));
  if (!m) return undefined;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Format a local Date as yyyy-MM-dd. */
export function localDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
