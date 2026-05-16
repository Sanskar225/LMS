'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, LogOut, CheckCircle2, Menu, X, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const STEPS = [
  { n: 1, label: 'Personal Details',  path: '/borrower/personal-details', icon: '📝' },
  { n: 2, label: 'Upload Salary Slip', path: '/borrower/upload', icon: '📄' },
  { n: 3, label: 'Loan Config & Apply', path: '/borrower/loan-config', icon: '⚙️' },
  { n: 4, label: 'Loan Status',        path: '/borrower/status', icon: '📊' },
];

export default function BorrowerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/auth'); return; }
    if (user.role !== 'borrower') { router.replace('/dashboard'); }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = STEPS.find((s) => pathname.startsWith(s.path))?.n ?? 1;
  const currentStepIndex = currentStep - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur-md opacity-40"></div>
              <div className="relative w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Building2 size={18} className="text-white" />
              </div>
            </div>
            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent hidden sm:block">LoanPro</span>
              <span className="text-xs text-gray-500 hidden sm:block">Borrower Portal</span>
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-full border border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500">Welcome back,</p>
                <p className="text-sm font-semibold text-gray-800">{user?.name?.split(' ')[0] || 'User'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium rounded-xl hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile User Info */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Step Progress - Desktop */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5">
          {/* Desktop Steps */}
          <div className="hidden md:flex items-center justify-between">
            {STEPS.map((s, i) => {
              const done = currentStep > s.n;
              const active = currentStep === s.n;
              return (
                <div key={s.n} className="flex-1 relative">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {/* Step Circle */}
                        <div className="relative">
                          {done ? (
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                              <CheckCircle2 size={18} className="text-white" />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                              active 
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {s.n}
                            </div>
                          )}
                          {/* Pulse effect for active step */}
                          {active && (
                            <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
                          )}
                        </div>
                        
                        {/* Step Label */}
                        <div className="ml-3">
                          <p className={`text-xs font-medium transition-colors ${
                            active ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            Step {s.n}
                          </p>
                          <p className={`text-sm font-semibold transition-colors ${
                            active ? 'text-gray-900' : done ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {s.label}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Connector Line */}
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 mx-4">
                        <div className={`h-0.5 rounded-full transition-all duration-500 ${
                          done ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-200'
                        }`} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Steps - Simplified */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Step {currentStep} of {STEPS.length}
              </p>
              <p className="text-xs text-gray-500">
                {STEPS[currentStepIndex]?.label}
              </p>
            </div>
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {STEPS.map((s) => (
                  <div 
                    key={s.n}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentStep >= s.n ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Banner - Subtle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-xs text-blue-700">
            <Shield size={12} />
            <span>Your information is protected with bank-grade encryption</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-xs text-gray-500">
            <p>© 2024 LoanPro. All rights reserved.</p>
            <p className="mt-1">Need help? Contact our support team</p>
          </div>
        </div>
      </footer>
    </div>
  );
}