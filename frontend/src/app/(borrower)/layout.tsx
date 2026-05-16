'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const STEPS = [
  { n: 1, label: 'Personal Details',  path: '/borrower/personal-details' },
  { n: 2, label: 'Upload Salary Slip', path: '/borrower/upload' },
  { n: 3, label: 'Loan Config & Apply', path: '/borrower/loan-config' },
  { n: 4, label: 'Loan Status',        path: '/borrower/status' },
];

export default function BorrowerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/auth'); return; }
    if (user.role !== 'borrower') { router.replace('/dashboard'); }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const currentStep = STEPS.find((s) => pathname.startsWith(s.path))?.n ?? 1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-blue-800 text-lg hidden sm:block">LoanPro</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              <span className="text-gray-400">Welcome,</span> <span className="font-semibold">{user?.name}</span>
            </span>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Step Progress */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const done = currentStep > s.n;
              const active = currentStep === s.n;
              return (
                <div key={s.n} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active ? 'bg-blue-50 text-blue-700' : done ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {done ? (
                      <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        active ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {s.n}
                      </div>
                    )}
                    <span className="hidden sm:block whitespace-nowrap">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 sm:w-10 h-0.5 mx-1 rounded-full flex-shrink-0 ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
