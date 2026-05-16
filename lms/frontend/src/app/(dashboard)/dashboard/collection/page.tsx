'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard, RefreshCw, PlusCircle, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, STATUS_BADGE } from '@/lib/utils';
import { Loan } from '@/types';

interface PaymentForm {
  utrNumber: string;
  amount: string;
  date: string;
}

export default function CollectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<Loan | null>(null);
  const [form, setForm] = useState<PaymentForm>({
    utrNumber: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && !['admin','collection'].includes(user.role)) { router.replace('/dashboard'); return; }
    fetchLoans();
  }, [user]);

  const fetchLoans = () => {
    setLoading(true);
    api.get('/loans/collection/active')
      .then(({ data }) => setLoans(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openPayModal = (loan: Loan) => {
    setPayModal(loan);
    setForm({
      utrNumber: '',
      amount: loan.outstandingBalance.toFixed(0),
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handlePayment = async () => {
    if (!payModal) return;
    const { utrNumber, amount, date } = form;
    if (!utrNumber.trim() || !amount || !date) {
      toast.error('All fields are required.'); return;
    }
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) { toast.error('Amount must be a positive number.'); return; }

    setProcessing(true);
    try {
      const { data } = await api.post(`/loans/collection/${payModal._id}/payment`, {
        utrNumber: utrNumber.trim(),
        amount: amt,
        date,
      });
      toast.success(data.message);
      setPayModal(null);
      fetchLoans();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed.');
    } finally {
      setProcessing(false);
    }
  };

  const disbursedLoans = loans.filter(l => l.status === 'disbursed');
  const closedLoans    = loans.filter(l => l.status === 'closed');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Collection</h1>
          <p className="page-subtitle">Record payments and track loan repayments</p>
        </div>
        <button onClick={fetchLoans} className="btn-md btn-secondary">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{disbursedLoans.length}</p>
          <p className="text-xs text-gray-600 mt-0.5">Active Loans</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{closedLoans.length}</p>
          <p className="text-xs text-gray-600 mt-0.5">Fully Repaid</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-700">
            {formatCurrency(disbursedLoans.reduce((s, l) => s + l.outstandingBalance, 0))}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">Total Outstanding</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : loans.length === 0 ? (
        <div className="card text-center py-16">
          <CreditCard size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No disbursed loans yet.</p>
          <p className="text-gray-400 text-sm mt-1">Loans appear here after disbursement.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const borrower = typeof loan.borrowerId === 'object' ? loan.borrowerId as any : null;
            const pct = loan.totalRepayment > 0
              ? Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100)
              : 0;
            const isExpanded = expanded === loan._id;

            return (
              <div key={loan._id} className="card animate-slide-up">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-900">{borrower?.name}</p>
                      <span className={`badge ${STATUS_BADGE[loan.status]}`}>{loan.status.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-gray-500">{borrower?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Disbursed: {loan.disbursedAt ? formatDate(loan.disbursedAt) : '—'}
                    </p>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-3 gap-3 sm:min-w-[280px]">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-0.5">Total Due</p>
                      <p className="font-bold text-sm">{formatCurrency(loan.totalRepayment)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-0.5">Paid</p>
                      <p className="font-bold text-sm text-emerald-700">{formatCurrency(loan.totalPaid)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-0.5">Outstanding</p>
                      <p className="font-bold text-sm text-orange-700">{formatCurrency(loan.outstandingBalance)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:self-start">
                    {loan.status === 'disbursed' && (
                      <button onClick={() => openPayModal(loan)} className="btn-md btn-primary whitespace-nowrap">
                        <PlusCircle size={15} /> Record Payment
                      </button>
                    )}
                    <button onClick={() => setExpanded(isExpanded ? null : loan._id)}
                      className="btn-md btn-secondary">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Repayment Progress</span>
                    <span className="font-medium">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        loan.status === 'closed' ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Expanded payment history */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Payment History ({loan.payments?.length || 0} payments)
                    </h4>
                    {!loan.payments?.length ? (
                      <p className="text-sm text-gray-400 text-center py-4">No payments recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-1.5 bg-gray-50 rounded-lg">
                          <span>UTR Number</span>
                          <span>Date</span>
                          <span className="text-right">Amount</span>
                          <span className="text-right">Recorded By</span>
                        </div>
                        {[...loan.payments].reverse().map((p) => (
                          <div key={p._id} className="grid grid-cols-4 text-sm px-3 py-2.5 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="font-mono text-xs text-gray-600 truncate">{p.utrNumber}</span>
                            <span className="text-gray-600">{formatDate(p.date)}</span>
                            <span className="text-right font-semibold text-emerald-700">{formatCurrency(p.amount)}</span>
                            <span className="text-right text-gray-400 text-xs">
                              {typeof p.recordedBy === 'object' ? (p.recordedBy as any).name : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {loan.status === 'closed' && (
                  <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">
                      Loan fully repaid on {loan.closedAt ? formatDate(loan.closedAt) : '—'}. 🎉
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CreditCard size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Record Payment</h3>
                <p className="text-sm text-gray-500">
                  {typeof payModal.borrowerId === 'object' ? (payModal.borrowerId as any).name : ''}
                </p>
              </div>
            </div>

            {/* Outstanding banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-5 text-center">
              <p className="text-xs text-orange-600 mb-0.5">Outstanding Balance</p>
              <p className="text-2xl font-bold text-orange-700">{formatCurrency(payModal.outstandingBalance)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">
                  UTR Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input pl-9 font-mono"
                    placeholder="Unique Transaction Reference"
                    value={form.utrNumber}
                    onChange={(e) => setForm({ ...form, utrNumber: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Must be unique across all payments globally.</p>
              </div>

              <div>
                <label className="label">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={payModal.outstandingBalance}
                  placeholder={`Max: ${formatCurrency(payModal.outstandingBalance)}`}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Cannot exceed outstanding: {formatCurrency(payModal.outstandingBalance)}
                </p>
              </div>

              <div>
                <label className="label">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>

            {/* Auto-close note */}
            {Number(form.amount) >= payModal.outstandingBalance && Number(form.amount) > 0 && (
              <div className="mt-4 flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700">
                  This payment will fully settle the loan. Loan will auto-close after recording!
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setPayModal(null)} className="btn-md btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handlePayment} disabled={processing} className="btn-md btn-success flex-1">
                {processing
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Recording…</>
                  : <><CheckCircle2 size={16} /> Record Payment</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
