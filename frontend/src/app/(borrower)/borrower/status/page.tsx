'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, XCircle, Banknote, Lock, PlusCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, STATUS_BADGE } from '@/lib/utils';
import { Loan } from '@/types';

const STATUS_META: Record<string, { icon: any; label: string; desc: string; color: string }> = {
  applied:    { icon: Clock,        label: 'Under Review',  desc: 'Your application is being reviewed by our team.',             color: 'text-blue-600' },
  sanctioned: { icon: CheckCircle2, label: 'Sanctioned',   desc: 'Loan approved! Awaiting fund disbursement.',                   color: 'text-amber-600' },
  rejected:   { icon: XCircle,      label: 'Rejected',     desc: 'Your application was not approved.',                           color: 'text-red-600' },
  disbursed:  { icon: Banknote,     label: 'Disbursed',    desc: 'Funds have been released. Repayment is in progress.',          color: 'text-purple-600' },
  closed:     { icon: Lock,         label: 'Fully Repaid', desc: 'Loan fully repaid. Congratulations! 🎉',                      color: 'text-emerald-600' },
};

export default function StatusPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = () => {
    setLoading(true);
    api.get('/loans/my-loans').then(({ data }) => setLoans(data.data))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const hasActive = loans.some((l) => ['applied','sanctioned','disbursed'].includes(l.status));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title">My Loan Applications</h1>
          <p className="page-subtitle">Track the status of your loan journey</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLoans} className="btn-md btn-secondary">
            <RefreshCw size={15} /> Refresh
          </button>
          {!hasActive && (
            <button onClick={() => router.push('/borrower/personal-details')} className="btn-md btn-primary">
              <PlusCircle size={15} /> New Loan
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : loans.length === 0 ? (
        <div className="card text-center py-16">
          <Banknote size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No loan applications yet.</p>
          <button onClick={() => router.push('/borrower/personal-details')} className="btn-md btn-primary mt-4">
            Apply Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const meta = STATUS_META[loan.status];
            const Icon = meta.icon;
            const pct = loan.totalRepayment > 0 ? Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100) : 0;
            return (
              <div key={loan._id} className="card animate-slide-up">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      loan.status === 'applied' ? 'bg-blue-100' :
                      loan.status === 'sanctioned' ? 'bg-amber-100' :
                      loan.status === 'rejected' ? 'bg-red-100' :
                      loan.status === 'disbursed' ? 'bg-purple-100' : 'bg-emerald-100'
                    }`}>
                      <Icon size={20} className={meta.color} />
                    </div>
                    <div>
                      <span className={`badge ${STATUS_BADGE[loan.status]}`}>{loan.status.toUpperCase()}</span>
                      <p className="text-xs text-gray-500 mt-1">{meta.desc}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(loan.createdAt)}</p>
                </div>

                {/* Loan details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Principal</p>
                    <p className="font-semibold text-sm">{formatCurrency(loan.principalAmount)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Tenure</p>
                    <p className="font-semibold text-sm">{loan.tenureDays} days</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Interest (12% SI)</p>
                    <p className="font-semibold text-sm">{formatCurrency(loan.simpleInterest)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Total Repayment</p>
                    <p className="font-semibold text-sm text-blue-700">{formatCurrency(loan.totalRepayment)}</p>
                  </div>
                </div>

                {/* Rejection reason */}
                {loan.status === 'rejected' && loan.rejectionReason && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-700 mb-0.5">Rejection Reason:</p>
                    <p className="text-sm text-red-600">{loan.rejectionReason}</p>
                  </div>
                )}

                {/* Payment progress */}
                {(loan.status === 'disbursed' || loan.status === 'closed') && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-0.5">Total Paid</p>
                        <p className="font-semibold text-sm text-emerald-700">{formatCurrency(loan.totalPaid)}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-0.5">Outstanding</p>
                        <p className="font-semibold text-sm text-orange-700">{formatCurrency(loan.outstandingBalance)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-0.5">Payments</p>
                        <p className="font-semibold text-sm">{loan.payments?.length || 0}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Repayment Progress</span>
                        <span>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${loan.status === 'closed' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
