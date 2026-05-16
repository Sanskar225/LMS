'use client';
import { useEffect, useState } from 'react';
import { FileText, CheckSquare, Banknote, CreditCard, Users, TrendingUp, Lock, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Loan } from '@/types';

interface Stats {
  total: number;
  applied: number;
  sanctioned: number;
  disbursed: number;
  closed: number;
  rejected: number;
  totalDisbursed: number;
  totalCollected: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total:0, applied:0, sanctioned:0, disbursed:0, closed:0, rejected:0, totalDisbursed:0, totalCollected:0 });
  const [loading, setLoading] = useState(true);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);

  useEffect(() => {
    api.get('/loans/all').then(({ data }) => {
      const loans: Loan[] = data.data;
      setRecentLoans(loans.slice(0, 5));
      setStats({
        total:          loans.length,
        applied:        loans.filter(l => l.status === 'applied').length,
        sanctioned:     loans.filter(l => l.status === 'sanctioned').length,
        disbursed:      loans.filter(l => l.status === 'disbursed').length,
        closed:         loans.filter(l => l.status === 'closed').length,
        rejected:       loans.filter(l => l.status === 'rejected').length,
        totalDisbursed: loans.filter(l => ['disbursed','closed'].includes(l.status)).reduce((s,l) => s + l.principalAmount, 0),
        totalCollected: loans.reduce((s,l) => s + l.totalPaid, 0),
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: 'Total Applications', value: stats.total,     icon: FileText,    bg: 'bg-blue-50',   icon_color: 'text-blue-600',   border: 'border-blue-100' },
    { label: 'Pending Sanction',   value: stats.applied,   icon: TrendingUp,  bg: 'bg-orange-50', icon_color: 'text-orange-600', border: 'border-orange-100' },
    { label: 'Sanctioned',         value: stats.sanctioned,icon: CheckSquare, bg: 'bg-amber-50',  icon_color: 'text-amber-600',  border: 'border-amber-100' },
    { label: 'Disbursed',          value: stats.disbursed, icon: Banknote,    bg: 'bg-purple-50', icon_color: 'text-purple-600', border: 'border-purple-100' },
    { label: 'Closed / Repaid',    value: stats.closed,    icon: Lock,        bg: 'bg-emerald-50',icon_color: 'text-emerald-600',border: 'border-emerald-100' },
    { label: 'Rejected',           value: stats.rejected,  icon: XCircle,     bg: 'bg-red-50',    icon_color: 'text-red-500',    border: 'border-red-100' },
  ];

  const STATUS_BADGE: Record<string, string> = {
    applied:    'bg-blue-100 text-blue-700',
    sanctioned: 'bg-amber-100 text-amber-700',
    rejected:   'bg-red-100 text-red-700',
    disbursed:  'bg-purple-100 text-purple-700',
    closed:     'bg-emerald-100 text-emerald-700',
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="text-blue-700">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here's the current state of your loan portfolio.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {STAT_CARDS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className={`bg-white rounded-xl border ${c.border} p-5 flex items-center gap-4 shadow-sm`}>
                  <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={22} className={c.icon_color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                    <p className="text-sm text-gray-500">{c.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Money summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-5 text-white">
              <p className="text-blue-200 text-sm mb-1">Total Amount Disbursed</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalDisbursed)}</p>
              <p className="text-blue-300 text-xs mt-1">Across all disbursed + closed loans</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-5 text-white">
              <p className="text-emerald-200 text-sm mb-1">Total Collections Received</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalCollected)}</p>
              <p className="text-emerald-300 text-xs mt-1">Across all payment records</p>
            </div>
          </div>

          {/* Recent loans */}
          {recentLoans.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Recent Applications</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Borrower','Amount','Tenure','Interest','Total','Status','Date'].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentLoans.map((loan) => (
                    <tr key={loan._id} className="table-row">
                      <td className="table-cell font-medium text-gray-900">
                        {typeof loan.borrowerId === 'object' ? (loan.borrowerId as any).name : '—'}
                      </td>
                      <td className="table-cell">{formatCurrency(loan.principalAmount)}</td>
                      <td className="table-cell">{loan.tenureDays}d</td>
                      <td className="table-cell">{formatCurrency(loan.simpleInterest)}</td>
                      <td className="table-cell font-medium">{formatCurrency(loan.totalRepayment)}</td>
                      <td className="table-cell">
                        <span className={`badge ${STATUS_BADGE[loan.status]}`}>{loan.status}</span>
                      </td>
                      <td className="table-cell text-gray-400">
                        {new Date(loan.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
