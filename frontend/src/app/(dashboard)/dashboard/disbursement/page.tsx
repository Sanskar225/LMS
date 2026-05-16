'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, RefreshCw, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SanctionedLoan {
  _id: string;
  borrowerId: { _id: string; name: string; email: string };
  sanctionedBy?: { name: string; email: string };
  principalAmount: number;
  tenureDays: number;
  simpleInterest: number;
  totalRepayment: number;
  sanctionedAt?: string;
  createdAt: string;
}

export default function DisbursementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<SanctionedLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmLoan, setConfirmLoan] = useState<SanctionedLoan | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && !['admin','disbursement'].includes(user.role)) { router.replace('/dashboard'); return; }
    fetchLoans();
  }, [user]);

  const fetchLoans = () => {
    setLoading(true);
    api.get('/loans/disbursement/sanctioned')
      .then(({ data }) => setLoans(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleDisburse = async () => {
    if (!confirmLoan) return;
    setProcessing(true);
    try {
      await api.patch(`/loans/disbursement/${confirmLoan._id}/disburse`);
      toast.success('💸 Loan disbursed! Funds released to borrower.');
      setConfirmLoan(null);
      fetchLoans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Disbursement failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Disbursement</h1>
          <p className="page-subtitle">Release funds for sanctioned loans</p>
        </div>
        <button onClick={fetchLoans} className="btn-md btn-secondary">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : loans.length === 0 ? (
        <div className="card text-center py-16">
          <Banknote size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No sanctioned loans awaiting disbursement.</p>
          <p className="text-gray-400 text-sm mt-1">Loans appear here after sanction approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div key={loan._id} className="card animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Borrower info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{loan.borrowerId.name}</p>
                    <span className="badge bg-amber-100 text-amber-700">SANCTIONED</span>
                  </div>
                  <p className="text-sm text-gray-500">{loan.borrowerId.email}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {loan.sanctionedBy && (
                      <span>✅ Sanctioned by: <strong>{loan.sanctionedBy.name}</strong></span>
                    )}
                    {loan.sanctionedAt && (
                      <span>📅 On: <strong>{formatDate(loan.sanctionedAt)}</strong></span>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-3 gap-3 sm:min-w-[300px]">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Principal</p>
                    <p className="font-bold text-sm">{formatCurrency(loan.principalAmount)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Interest</p>
                    <p className="font-bold text-sm">{formatCurrency(loan.simpleInterest)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Total Repayment</p>
                    <p className="font-bold text-sm text-purple-700">{formatCurrency(loan.totalRepayment)}</p>
                  </div>
                </div>

                {/* Disburse button */}
                <button onClick={() => setConfirmLoan(loan)}
                  className="btn-md btn-primary whitespace-nowrap sm:self-center">
                  <Send size={15} /> Disburse Funds
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {confirmLoan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Send size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Confirm Disbursement</h3>
                <p className="text-sm text-gray-500">Release funds to borrower</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Borrower</span>
                <strong>{confirmLoan.borrowerId.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Principal Amount</span>
                <strong>{formatCurrency(confirmLoan.principalAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tenure</span>
                <strong>{confirmLoan.tenureDays} days</strong>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-500">Total Repayment Due</span>
                <strong className="text-purple-700 text-base">{formatCurrency(confirmLoan.totalRepayment)}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2 mb-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
              <AlertTriangle size={15} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                Confirming will mark this loan as <strong>Disbursed</strong> and move it to the Collection queue. This cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setConfirmLoan(null)} className="btn-md btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleDisburse} disabled={processing} className="btn-md btn-primary flex-1">
                {processing
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Processing…</>
                  : <><CheckCircle2 size={16} /> Confirm Disbursement</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
