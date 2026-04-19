import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatCurrency(amount: number, currency: 'JPY' | 'USD' = 'JPY') {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);
}
