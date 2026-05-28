import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

/**
 * Get localized value from an object with _vn / _en suffix fields.
 * Example: getLocalizedField(tour, 'title', 'vn') → tour.title_vn
 */
export function getLocalizedField<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  lang: string,
): string {
  const key = `${field}_${lang}` as keyof T;
  const fallback = `${field}_vn` as keyof T;
  return (obj[key] as string) || (obj[fallback] as string) || '';
}
