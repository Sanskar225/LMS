'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, RefreshCw } from 'lucide-react';
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
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Sales — Lead Tracking</h1>
          <p className="page-subtitle">All registered borrowers and their application stage</p>
        </div>
        <button onClick={fetchLeads} className="btn-md btn-secondary self-start">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Registered', value: summary.total,       color: 'text-blue-700',    bg: 'bg-blue-50' },
          { label: 'Profile Completed', value: summary.profileDone, color: 'text-amber-700',   bg: 'bg-amber-50' },
          { label: 'Loan Applied',      value: summary.applied,     color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map((c) => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4 text-center border border-white`}>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-4 w-full max-w-sm">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          placeholder="Search by name, email or PAN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm outline-none flex-1 bg-transparent text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr>
                  {['Borrower','Email','PAN','Employment','Monthly Salary','BRE Status','Loan Status','Registered'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <Users size={32} className="mx-auto mb-2 text-gray-200" />
                      {search ? 'No results found.' : 'No leads yet.'}
                    </td>
                  </tr>
                ) : filtered.map((lead) => (
                  <tr key={lead.user._id} className="table-row">
                    <td className="table-cell font-medium text-gray-900">{lead.user.name}</td>
                    <td className="table-cell text-gray-500">{lead.user.email}</td>
                    <td className="table-cell font-mono text-xs">
                      {lead.profile?.pan || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="table-cell capitalize">
                      {lead.profile?.employmentMode?.replace('_', ' ') || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="table-cell">
                      {lead.profile
                        ? formatCurrency(lead.profile.monthlySalary)
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="table-cell">
                      {lead.profile ? (
                        <span className={`badge ${
                          lead.profile.breStatus === 'passed' ? 'bg-emerald-100 text-emerald-700' :
                          lead.profile.breStatus === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{lead.profile.breStatus}</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-500">pending</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {lead.latestLoan ? (
                        <span className={`badge ${STATUS_BADGE[lead.latestLoan.status]}`}>
                          {lead.latestLoan.status}
                        </span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-500">no loan</span>
                      )}
                    </td>
                    <td className="table-cell text-gray-400">{formatDate(lead.user.createdAt!)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            Showing {filtered.length} of {leads.length} leads
          </div>
        </div>
      )}
    </div>
  );
}
