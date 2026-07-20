import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { vi } from 'react-day-picker/locale';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  dmyToIso,
  isoToDmy,
  isoToLocalDate,
  localDateToIso,
  maskDmyInput,
  todayIso,
} from '@/lib/date-format';
import 'react-day-picker/style.css';

interface DateInputProps {
  id?: string;
  value: string; // yyyy-MM-dd (API) or ''
  onChange: (isoDate: string) => void;
  min?: string; // yyyy-MM-dd
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  'aria-label'?: string;
}

const POPUP_MIN_WIDTH = 300;

const VI_MONTHS = [
  'Tháng Một',
  'Tháng Hai',
  'Tháng Ba',
  'Tháng Tư',
  'Tháng Năm',
  'Tháng Sáu',
  'Tháng Bảy',
  'Tháng Tám',
  'Tháng Chín',
  'Tháng Mười',
  'Tháng Mười Một',
  'Tháng Mười Hai',
] as const;

const pickerStyle = {
  '--rdp-accent-color': '#e8eaed',
  '--rdp-accent-background-color': 'rgba(255,255,255,0.08)',
  '--rdp-day_button-border-radius': '0.35rem',
  '--rdp-selected-border': '2px solid #e8eaed',
  '--rdp-today-color': '#8ab4f8',
  '--rdp-outside-opacity': '0.35',
  '--rdp-day-height': '36px',
  '--rdp-day-width': '36px',
  '--rdp-day_button-height': '34px',
  '--rdp-day_button-width': '34px',
  '--rdp-nav_button-height': '1.75rem',
  '--rdp-nav_button-width': '1.75rem',
  '--rdp-nav-height': '0px',
} as CSSProperties;

function shouldAllowPopupMouseDownDefault(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest('button') || target.closest('[data-date-picker-menu]'),
  );
}

function initialViewMonth(value: string, min?: string) {
  return (
    isoToLocalDate(value) ??
    (min ? isoToLocalDate(min) : undefined) ??
    isoToLocalDate(todayIso())!
  );
}

interface MenuProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function PickerMenu({ label, open, onToggle, children }: MenuProps) {
  return (
    <div className="relative min-w-0 flex-1" data-date-picker-menu>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0d1117] px-3 py-2 text-sm font-medium text-[#e8eaed] transition-colors hover:bg-white/5"
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-[#8ab4f8] transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <ul
          className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#1c2128] py-1 shadow-2xl"
          data-date-picker-menu
        >
          {children}
        </ul>
      )}
    </div>
  );
}

/**
 * Date input: type dd/MM/yyyy + calendar picker. Emits yyyy-MM-dd for API.
 */
export default function DateInput({
  id,
  value,
  onChange,
  min,
  required,
  disabled,
  className,
  placeholder = 'dd/mm/yyyy',
  'aria-label': ariaLabel,
}: DateInputProps) {
  const [display, setDisplay] = useState(() => isoToDmy(value));
  const [invalid, setInvalid] = useState(false);
  const [hint, setHint] = useState('');
  const [open, setOpen] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [viewMonth, setViewMonth] = useState(() =>
    initialViewMonth(value, min),
  );
  const [openMonthMenu, setOpenMonthMenu] = useState(false);
  const [openYearMenu, setOpenYearMenu] = useState(false);
  const [popupPos, setPopupPos] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setDisplay(isoToDmy(value));
    setInvalid(false);
    setHint('');
  }

  const selected = isoToLocalDate(value);
  const minDate = min ? isoToLocalDate(min) : undefined;
  const today = isoToLocalDate(todayIso())!;
  const todayDisabled = Boolean(minDate && today < minDate);

  const startYear = (
    minDate ?? new Date(new Date().getFullYear() - 5, 0)
  ).getFullYear();
  const endYear = new Date().getFullYear() + 10;
  const years = useMemo(
    () =>
      Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i),
    [startYear, endYear],
  );

  const closeMenus = () => {
    setOpenMonthMenu(false);
    setOpenYearMenu(false);
  };

  const openPicker = () => {
    if (disabled) return;
    setViewMonth(initialViewMonth(value, min));
    setOpenMonthMenu(false);
    setOpenYearMenu(false);
    setOpen(true);
  };

  const closePicker = () => {
    setOpenMonthMenu(false);
    setOpenYearMenu(false);
    setOpen(false);
  };

  const updatePopupPosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const popupHeight = popupRef.current?.offsetHeight ?? 360;
    const popupWidth = Math.max(rect.width, POPUP_MIN_WIDTH);
    const gap = 8;
    const margin = 8;

    let top = rect.bottom + gap;
    if (top + popupHeight > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - popupHeight - gap);
    }

    let left = rect.left;
    if (left + popupWidth > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - popupWidth - margin);
    }

    setPopupPos({ top, left, minWidth: popupWidth });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePopupPosition();
    const raf = window.requestAnimationFrame(updatePopupPosition);
    return () => window.cancelAnimationFrame(raf);
  }, [open, openMonthMenu, openYearMenu, updatePopupPosition]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => updatePopupPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, updatePopupPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      closePicker();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePicker();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const applyIso = (iso: string) => {
    if (min && iso && iso < min) {
      setInvalid(true);
      setHint('Ngày phải từ hôm nay trở đi');
      return false;
    }
    setInvalid(false);
    setHint('');
    onChange(iso);
    setDisplay(iso ? isoToDmy(iso) : '');
    return true;
  };

  const commit = (text: string) => {
    if (!text.trim()) {
      setInvalid(false);
      setHint('');
      onChange('');
      return;
    }
    if (text.length < 10) {
      setInvalid(true);
      setHint('Nhập đủ dd/mm/yyyy');
      return;
    }
    const iso = dmyToIso(text);
    if (!iso) {
      setInvalid(true);
      setHint('Ngày không hợp lệ');
      return;
    }
    applyIso(iso);
  };

  const pickDate = (date: Date | undefined) => {
    if (!date) return;
    if (applyIso(localDateToIso(date))) closePicker();
  };

  const setMonthIndex = (monthIndex: number) => {
    setViewMonth(new Date(viewMonth.getFullYear(), monthIndex, 1));
    closeMenus();
  };

  const setYear = (year: number) => {
    setViewMonth(new Date(year, viewMonth.getMonth(), 1));
    closeMenus();
  };

  const calendarPopup =
    open && !disabled && popupPos
      ? createPortal(
          <div
            ref={popupRef}
            className="rounded-xl border border-white/10 bg-[#1c2128] p-3 shadow-2xl"
            style={{
              position: 'fixed',
              top: popupPos.top,
              left: popupPos.left,
              minWidth: popupPos.minWidth,
              zIndex: 9999,
              ...pickerStyle,
            }}
            onMouseDown={(e) => {
              if (!shouldAllowPopupMouseDownDefault(e.target)) {
                e.preventDefault();
              }
            }}
          >
            <div className="mb-3 flex gap-2">
              <PickerMenu
                label={VI_MONTHS[viewMonth.getMonth()]}
                open={openMonthMenu}
                onToggle={() => {
                  setOpenYearMenu(false);
                  setOpenMonthMenu((v) => !v);
                }}
              >
                {VI_MONTHS.map((name, index) => (
                  <li key={name}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setMonthIndex(index)}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10',
                        viewMonth.getMonth() === index
                          ? 'bg-[#8ab4f8]/15 font-medium text-[#8ab4f8]'
                          : 'text-[#e8eaed]',
                      )}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </PickerMenu>

              <PickerMenu
                label={String(viewMonth.getFullYear())}
                open={openYearMenu}
                onToggle={() => {
                  setOpenMonthMenu(false);
                  setOpenYearMenu((v) => !v);
                }}
              >
                {years.map((year) => (
                  <li key={year}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setYear(year)}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10',
                        viewMonth.getFullYear() === year
                          ? 'bg-[#8ab4f8]/15 font-medium text-[#8ab4f8]'
                          : 'text-[#e8eaed]',
                      )}
                    >
                      {year}
                    </button>
                  </li>
                ))}
              </PickerMenu>
            </div>

            <DayPicker
              mode="single"
              locale={vi}
              month={viewMonth}
              onMonthChange={setViewMonth}
              hideNavigation
              selected={selected}
              onSelect={pickDate}
              disabled={minDate ? { before: minDate } : undefined}
              startMonth={minDate ?? new Date(new Date().getFullYear() - 5, 0)}
              endMonth={new Date(new Date().getFullYear() + 10, 11)}
              className="text-sm text-[#e8eaed] [--rdp-background-color:transparent] [&_.rdp-month_caption]:hidden"
            />

            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <button
                type="button"
                className="text-sm font-medium text-[#8ab4f8] hover:underline"
                onClick={() => {
                  applyIso('');
                  closePicker();
                }}
              >
                Xóa
              </button>
              <button
                type="button"
                disabled={todayDisabled}
                className="text-sm font-medium text-[#8ab4f8] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => pickDate(today)}
              >
                Hôm nay
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative w-full" ref={rootRef}>
      <div className="relative" ref={anchorRef}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel || placeholder}
          aria-invalid={invalid || undefined}
          aria-expanded={open}
          value={display}
          onChange={(e) => {
            const next = maskDmyInput(e.target.value);
            setDisplay(next);
            if (next.length === 10) commit(next);
            else if (!next) {
              setInvalid(false);
              setHint('');
              onChange('');
            } else {
              setInvalid(false);
              setHint('');
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              if (
                !rootRef.current?.contains(document.activeElement) &&
                !popupRef.current?.contains(document.activeElement)
              ) {
                commit(display);
              }
            }, 0);
          }}
          onFocus={() => {
            openPicker();
          }}
          className={cn(
            'pr-10',
            className,
            invalid && 'ring-1 ring-red-500/60 border-red-500/40',
          )}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label="Mở lịch"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (disabled) return;
            if (open) closePicker();
            else openPicker();
          }}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-white disabled:opacity-40"
        >
          <Calendar className="size-4" />
        </button>
      </div>

      {calendarPopup}

      {invalid && hint && (
        <p className="mt-1 text-[11px] text-red-400">{hint}</p>
      )}
    </div>
  );
}
