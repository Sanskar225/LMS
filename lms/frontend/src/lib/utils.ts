import { LoanStatus } from '@/types';

// SI = (P × R × T) / (365 × 100)
export function calculateLoan(principal: number, tenureDays: number, rate = 12) {
  const si = (principal * rate * tenureDays) / (365 * 100);
  return {
    simpleInterest: Math.round(si * 100) / 100,
    totalRepayment: Math.round((principal + si) * 100) / 100,
  };
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const STATUS_BADGE: Record<LoanStatus, string> = {
  applied:    'bg-blue-100 text-blue-800 border border-blue-200',
  sanctioned: 'bg-amber-100 text-amber-800 border border-amber-200',
  rejected:   'bg-red-100 text-red-800 border border-red-200',
  disbursed:  'bg-purple-100 text-purple-800 border border-purple-200',
  closed:     'bg-emerald-100 text-emerald-800 border border-emerald-200',
};

export function clsx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
