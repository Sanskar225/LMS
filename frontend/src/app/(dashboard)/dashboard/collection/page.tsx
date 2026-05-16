'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard, RefreshCw, PlusCircle, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Hash, Users, DollarSign, 
  TrendingUp, Calendar, User, Mail, Clock, Award, Shield
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-4">
              <Shield size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Collection Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Collection Management
            </h1>
            <p className="text-gray-600 mt-2">Record payments and track loan repayments</p>
          </div>
          <button 
            onClick={fetchLoans} 
            className="px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl font-medium text-gray-700 hover:bg-white shadow-sm transition-all flex items-center gap-2 border border-gray-200"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <Users size={24} className="opacity-80" />
                <span className="text-xs opacity-80">Active Loans</span>
              </div>
              <p className="text-3xl font-bold">{disbursedLoans.length}</p>
              <p className="text-xs opacity-80 mt-1">Currently active</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <Award size={24} className="opacity-80" />
                <span className="text-xs opacity-80">Fully Repaid</span>
              </div>
              <p className="text-3xl font-bold">{closedLoans.length}</p>
              <p className="text-xs opacity-80 mt-1">Successfully closed</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <DollarSign size={24} className="opacity-80" />
                <span className="text-xs opacity-80">Total Outstanding</span>
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(disbursedLoans.reduce((s, l) => s + l.outstandingBalance, 0))}
              </p>
              <p className="text-xs opacity-80 mt-1">Pending collection</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-indigo-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : loans.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 text-center py-16">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full blur-2xl opacity-20"></div>
              <CreditCard size={64} className="relative text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No disbursed loans yet.</p>
            <p className="text-gray-400 text-sm mt-1">Loans appear here after disbursement.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {loans.map((loan) => {
              const borrower = typeof loan.borrowerId === 'object' ? loan.borrowerId as any : null;
              const pct = loan.totalRepayment > 0
                ? Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100)
                : 0;
              const isExpanded = expanded === loan._id;

              return (
                <div key={loan._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
                  {/* Header row */}
                  <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    {/* Borrower Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{borrower?.name || 'N/A'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Mail size={12} className="text-gray-400" />
                            <p className="text-xs text-gray-500">{borrower?.email || 'No email'}</p>
                          </div>
                        </div>
                        <span className={`badge ${STATUS_BADGE[loan.status]} ml-2`}>
                          {loan.status.toUpperCase()}
                        </span>
                      </div>
                      {loan.disbursedAt && (
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-400">
                            Disbursed: {formatDate(loan.disbursedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Amounts Cards */}
                    <div className="grid grid-cols-3 gap-3 min-w-[280px]">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Total Due</p>
                        <p className="font-bold text-gray-800">{formatCurrency(loan.totalRepayment)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 text-center border border-emerald-200">
                        <p className="text-xs text-gray-500 mb-1">Paid</p>
                        <p className="font-bold text-emerald-700">{formatCurrency(loan.totalPaid)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center border border-orange-200">
                        <p className="text-xs text-gray-500 mb-1">Outstanding</p>
                        <p className="font-bold text-orange-700">{formatCurrency(loan.outstandingBalance)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {loan.status === 'disbursed' && (
                        <button 
                          onClick={() => openPayModal(loan)} 
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <PlusCircle size={16} /> Record Payment
                        </button>
                      )}
                      <button 
                        onClick={() => setExpanded(isExpanded ? null : loan._id)}
                        className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-indigo-300 transition-all flex items-center gap-2"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-5">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} /> Repayment Progress
                      </span>
                      <span className="font-semibold">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute h-full rounded-full transition-all duration-700 ${
                          loan.status === 'closed' 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded payment history */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CreditCard size={14} className="text-indigo-600" />
                        Payment History ({loan.payments?.length || 0} payments)
                      </h4>
                      {!loan.payments?.length ? (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl">
                          <Clock size={32} className="text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No payments recorded yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-4 text-xs font-semibold text-gray-600 uppercase tracking-wide px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                            <span>UTR Number</span>
                            <span>Date</span>
                            <span className="text-right">Amount</span>
                            <span className="text-right">Recorded By</span>
                          </div>
                          {[...loan.payments].reverse().map((p, idx) => (
                            <div 
                              key={p._id} 
                              className="grid grid-cols-4 text-sm px-3 py-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all"
                            >
                              <span className="font-mono text-xs text-indigo-600 font-semibold">
                                {p.utrNumber}
                              </span>
                              <span className="text-gray-600">{formatDate(p.date)}</span>
                              <span className="text-right font-bold text-emerald-700">
                                {formatCurrency(p.amount)}
                              </span>
                              <span className="text-right text-gray-500 text-xs">
                                {typeof p.recordedBy === 'object' ? (p.recordedBy as any).name : '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Closed Loan Celebration */}
                  {loan.status === 'closed' && (
                    <div className="mt-4 flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-700">
                          Loan fully repaid! 🎉
                        </p>
                        <p className="text-xs text-emerald-600">
                          Closed on {loan.closedAt ? formatDate(loan.closedAt) : '—'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Modal */}
        {payModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
                  <p className="text-sm text-gray-500">
                    {typeof payModal.borrowerId === 'object' ? (payModal.borrowerId as any).name : ''}
                  </p>
                </div>
              </div>

              {/* Outstanding banner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 mb-5 text-white">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <p className="text-xs opacity-90 mb-1">Outstanding Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(payModal.outstandingBalance)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    UTR Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-mono"
                      placeholder="Unique Transaction Reference"
                      value={form.utrNumber}
                      onChange={(e) => setForm({ ...form, utrNumber: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Must be unique across all payments globally.</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Payment Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    type="number"
                    min={1}
                    max={payModal.outstandingBalance}
                    placeholder={`Max: ${formatCurrency(payModal.outstandingBalance)}`}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Max: {formatCurrency(payModal.outstandingBalance)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    type="date"
                    value={form.date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Auto-close note */}
              {Number(form.amount) >= payModal.outstandingBalance && Number(form.amount) > 0 && (
                <div className="mt-4 flex items-start gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 font-medium">
                    This payment will fully settle the loan. The loan will auto-close after recording!
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setPayModal(null)} 
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePayment} 
                  disabled={processing} 
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}