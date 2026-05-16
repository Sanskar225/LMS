'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, RefreshCw, User, Mail, CreditCard, Briefcase, DollarSign, Calendar, TrendingUp, Award, Filter, Download } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatCurrency, STATUS_BADGE } from '@/lib/utils';
import { SalesLead } from '@/types';

export default function SalesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user && !['admin','sales'].includes(user.role)) { router.replace('/dashboard'); return; }
    fetchLeads();
  }, [user]);

  const fetchLeads = () => {
    setLoading(true);
    api.get('/loans/sales/leads')
      .then(({ data }) => setLeads(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.email?.toLowerCase().includes(q) ||
      l.profile?.pan?.toLowerCase().includes(q)
    );
  });

  const summary = {
    total: leads.length,
    profileDone: leads.filter(l => l.profile).length,
    applied: leads.filter(l => l.latestLoan).length,
    approved: leads.filter(l => l.latestLoan?.status === 'sanctioned' || l.latestLoan?.status === 'disbursed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-4">
              <Users size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Sales Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Lead Tracking
            </h1>
            <p className="text-gray-600 mt-2">Track all registered borrowers and their application stage</p>
          </div>
          <button 
            onClick={fetchLeads} 
            className="px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl font-medium text-gray-700 hover:bg-white shadow-sm transition-all flex items-center gap-2 border border-gray-200 self-start"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <Users size={24} className="opacity-80" />
                <span className="text-xs opacity-80">Total</span>
              </div>
              <p className="text-3xl font-bold">{summary.total}</p>
              <p className="text-xs opacity-80 mt-1">Registered Borrowers</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <CreditCard size={24} className="opacity-80" />
                <span className="text-xs opacity-80">Profile</span>
              </div>
              <p className="text-3xl font-bold">{summary.profileDone}</p>
              <p className="text-xs opacity-80 mt-1">Profile Completed</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp size={24} className="opacity-80" />
                <span className="text-xs opacity-80">Applications</span>
              </div>
              <p className="text-3xl font-bold">{summary.applied}</p>
              <p className="text-xs opacity-80 mt-1">Loan Applied</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <Award size={24} className="opacity-80" />
                <span className="text-xs opacity-80">Approved</span>
              </div>
              <p className="text-3xl font-bold">{summary.approved}</p>
              <p className="text-xs opacity-80 mt-1">Loans Sanctioned/Disbursed</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-2 mb-6 max-w-md">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              placeholder="Search by name, email or PAN…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm outline-none flex-1 bg-transparent text-gray-700 placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-gray-600">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    {['Borrower', 'Email', 'PAN', 'Employment', 'Monthly Salary', 'BRE Status', 'Loan Status', 'Registered'].map((h, i) => (
                      <th key={h} className={`px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                        i === 0 ? 'rounded-tl-xl' : i === 7 ? 'rounded-tr-xl' : ''
                      }`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
                            <Users size={32} className="text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            {search ? 'No results found.' : 'No leads yet.'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {search ? 'Try adjusting your search terms' : 'Leads will appear here when borrowers register'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((lead, idx) => (
                      <tr key={lead.user._id} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-transparent transition-all duration-200 ${
                        idx % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                      }`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                              {lead.user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="font-semibold text-gray-900">{lead.user.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Mail size={12} className="text-gray-400" />
                            <span className="text-gray-600">{lead.user.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {lead.profile?.pan ? (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700">
                              {lead.profile.pan}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {lead.profile?.employmentMode ? (
                            <div className="flex items-center gap-1">
                              <Briefcase size={12} className="text-gray-400" />
                              <span className="capitalize text-gray-700">
                                {lead.profile.employmentMode.replace('_', ' ')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {lead.profile ? (
                            <div className="flex items-center gap-1">
                              <DollarSign size={12} className="text-gray-400" />
                              <span className="font-semibold text-gray-800">
                                {formatCurrency(lead.profile.monthlySalary)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {lead.profile ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              lead.profile.breStatus === 'passed' 
                                ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200' 
                                : lead.profile.breStatus === 'failed' 
                                ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {lead.profile.breStatus === 'passed' && '✓ '}
                              {lead.profile.breStatus === 'failed' && '✗ '}
                              {lead.profile.breStatus}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {lead.latestLoan ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[lead.latestLoan.status]}`}>
                              {lead.latestLoan.status === 'applied' && '📋 '}
                              {lead.latestLoan.status === 'sanctioned' && '✓ '}
                              {lead.latestLoan.status === 'disbursed' && '💰 '}
                              {lead.latestLoan.status === 'rejected' && '✗ '}
                              {lead.latestLoan.status === 'closed' && '🏆 '}
                              {lead.latestLoan.status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                              📝 No loan
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-gray-500 text-xs">{formatDate(lead.user.createdAt!)}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex justify-between items-center">
              <div className="text-xs text-gray-600">
                Showing <strong className="text-gray-900">{filtered.length}</strong> of <strong className="text-gray-900">{leads.length}</strong> leads
              </div>
              {search && filtered.length !== leads.length && (
                <div className="text-xs text-indigo-600">
                  Filtered by: "{search}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}