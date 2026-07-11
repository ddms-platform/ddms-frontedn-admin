import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DayPicker } from 'react-day-picker';
import { vi } from 'react-day-picker/locale';
import { Calendar } from 'lucide-react';
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
  const rootRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
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
    if (applyIso(localDateToIso(date))) setOpen(false);
  };

  return (
    <div className="relative w-full" ref={rootRef}>
      <div className="relative">
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
              if (!rootRef.current?.contains(document.activeElement)) {
                commit(display);
              }
            }, 0);
          }}
          onFocus={() => {
            if (!disabled) setOpen(true);
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
          onClick={() => !disabled && setOpen((v) => !v)}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-white disabled:opacity-40"
        >
          <Calendar className="size-4" />
        </button>
      </div>

      {open && !disabled && (
        <div
          className="absolute z-50 mt-2 rounded-xl border border-white/10 bg-[#1c2128] p-3 shadow-2xl"
          onMouseDown={(e) => e.preventDefault()}
          style={
            {
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
              '--rdp-nav-height': '2.25rem',
            } as CSSProperties
          }
        >
          <DayPicker
            mode="single"
            locale={vi}
            captionLayout="dropdown"
            navLayout="after"
            selected={selected}
            defaultMonth={selected ?? minDate ?? today}
            onSelect={pickDate}
            disabled={minDate ? { before: minDate } : undefined}
            startMonth={minDate ?? new Date(new Date().getFullYear() - 5, 0)}
            endMonth={new Date(new Date().getFullYear() + 10, 11)}
            className="text-sm text-[#e8eaed] [--rdp-background-color:transparent]"
          />
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
            <button
              type="button"
              className="text-sm font-medium text-[#8ab4f8] hover:underline"
              onClick={() => {
                applyIso('');
                setOpen(false);
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
        </div>
      )}

      {invalid && hint && (
        <p className="mt-1 text-[11px] text-red-400">{hint}</p>
      )}
    </div>
  );
}
