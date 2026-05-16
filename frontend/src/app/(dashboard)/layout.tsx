'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, LogOut, Users, CheckSquare,
  Banknote, CreditCard, LayoutDashboard, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { label: 'Overview',     path: '/dashboard',                icon: LayoutDashboard, roles: ['admin','sales','sanction','disbursement','collection'] },
  { label: 'Sales',        path: '/dashboard/sales',          icon: Users,           roles: ['admin','sales'] },
  { label: 'Sanction',     path: '/dashboard/sanction',       icon: CheckSquare,     roles: ['admin','sanction'] },
  { label: 'Disbursement', path: '/dashboard/disbursement',   icon: Banknote,        roles: ['admin','disbursement'] },
  { label: 'Collection',   path: '/dashboard/collection',     icon: CreditCard,      roles: ['admin','collection'] },
];

const ROLE_BADGE: Record<string, string> = {
  admin:        'bg-red-100 text-red-700',
  sales:        'bg-blue-100 text-blue-700',
  sanction:     'bg-amber-100 text-amber-700',
  disbursement: 'bg-purple-100 text-purple-700',
  collection:   'bg-emerald-100 text-emerald-700',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/auth'); return; }
    if (user.role === 'borrower') { router.replace('/borrower/personal-details'); }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
      </div>
    );
  }

  const visibleNav = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center shadow">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-none">LoanPro</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Operations Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const exact = item.path === '/dashboard';
            const active = exact ? pathname === item.path : pathname.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                <Icon size={16} />
                <span>{item.label}</span>
                {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${ROLE_BADGE[user.role] || 'bg-gray-100 text-gray-600'}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors font-medium">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Page Content ── */}
      <main className="ml-60 flex-1 min-h-screen p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
