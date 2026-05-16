'use client';
import { useEffect, useState } from 'react';
import { FileText, CheckSquare, Banknote, CreditCard, Users, TrendingUp, Lock, XCircle, ArrowUp, ArrowDown, Activity, Calendar, User, DollarSign, Clock, Award, Zap } from 'lucide-react';
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
    { label: 'Total Applications', value: stats.total,     icon: FileText,    gradient: 'from-blue-500 to-cyan-500', color: 'text-blue-600' },
    { label: 'Pending Sanction',   value: stats.applied,   icon: TrendingUp,  gradient: 'from-orange-500 to-red-500', color: 'text-orange-600' },
    { label: 'Sanctioned',         value: stats.sanctioned,icon: CheckSquare, gradient: 'from-amber-500 to-yellow-500', color: 'text-amber-600' },
    { label: 'Disbursed',          value: stats.disbursed, icon: Banknote,    gradient: 'from-purple-500 to-pink-500', color: 'text-purple-600' },
    { label: 'Closed / Repaid',    value: stats.closed,    icon: Lock,        gradient: 'from-emerald-500 to-teal-500', color: 'text-emerald-600' },
    { label: 'Rejected',           value: stats.rejected,  icon: XCircle,     gradient: 'from-red-500 to-pink-500', color: 'text-red-600' },
  ];

  const STATUS_BADGE: Record<string, string> = {
    applied:    'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200',
    sanctioned: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200',
    rejected:   'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200',
    disbursed:  'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200',
    closed:     'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200',
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'applied': return '📋';
      case 'sanctioned': return '✓';
      case 'disbursed': return '💰';
      case 'rejected': return '✗';
      case 'closed': return '🏆';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-full mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-4">
            <Activity size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Admin Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's the current state of your loan portfolio.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-indigo-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
              {STAT_CARDS.map((c, idx) => {
                const Icon = c.icon;
                return (
                  <div 
                    key={c.label} 
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${c.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Banknote size={20} className="text-white" />
                      </div>
                      <p className="text-blue-100 text-sm">Total Amount Disbursed</p>
                    </div>
                    <ArrowUp size={20} className="text-emerald-400" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(stats.totalDisbursed)}</p>
                  <p className="text-blue-200 text-xs mt-2">Across all disbursed + closed loans</p>
                  <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <p className="text-emerald-100 text-sm">Total Collections Received</p>
                    </div>
                    <ArrowDown size={20} className="text-emerald-400" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(stats.totalCollected)}</p>
                  <p className="text-emerald-200 text-xs mt-2">Across all payment records</p>
                  <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Loans Table */}
            {recentLoans.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Clock size={16} className="text-white" />
                    </div>
                    <h2 className="font-semibold text-gray-800 text-lg">Recent Applications</h2>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      Last 5 loans
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        {['Borrower', 'Amount', 'Tenure', 'Interest', 'Total', 'Status', 'Date'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentLoans.map((loan, idx) => (
                        <tr key={loan._id} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-transparent transition-all duration-200 ${
                          idx % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                        }`}>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {typeof loan.borrowerId === 'object' ? ((loan.borrowerId as any).name?.charAt(0).toUpperCase() || 'U') : 'U'}
                              </div>
                              <span className="font-medium text-gray-900">
                                {typeof loan.borrowerId === 'object' ? (loan.borrowerId as any).name : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="font-semibold text-gray-800">{formatCurrency(loan.principalAmount)}</span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              <span className="text-gray-700">{loan.tenureDays}d</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-gray-700">{formatCurrency(loan.simpleInterest)}</span>
                          </td>
                          <td className="px-6 py-3">
                            <span className="font-semibold text-purple-700">{formatCurrency(loan.totalRepayment)}</span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[loan.status]}`}>
                              {getStatusIcon(loan.status)} {loan.status}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <Calendar size={11} />
                              {new Date(loan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Showing last {recentLoans.length} applications
                    </p>
                    <div className="flex items-center gap-1 text-xs text-indigo-600">
                      <Zap size={12} />
                      <span>Real-time data</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats Footer */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Award size={12} />
                  <span>Success Rate</span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {stats.total > 0 ? ((stats.closed / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <TrendingUp size={12} />
                  <span>Disbursal Rate</span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {stats.total > 0 ? (((stats.disbursed + stats.closed) / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <DollarSign size={12} />
                  <span>Avg Loan Size</span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {stats.totalDisbursed > 0 && stats.disbursed + stats.closed > 0 
                    ? formatCurrency(stats.totalDisbursed / (stats.disbursed + stats.closed))
                    : formatCurrency(0)}
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-200">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <User size={12} />
                  <span>Collection Rate</span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {stats.totalDisbursed > 0 ? ((stats.totalCollected / stats.totalDisbursed) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}