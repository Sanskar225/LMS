'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, RefreshCw, Send, AlertTriangle, CheckCircle2, User, Mail, Calendar, Clock, TrendingUp, Shield, DollarSign, Award } from 'lucide-react';
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

  // Calculate summary stats
  const totalPrincipal = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalInterest = loans.reduce((sum, l) => sum + l.simpleInterest, 0);
  const totalRepayment = loans.reduce((sum, l) => sum + l.totalRepayment, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-4">
              <Shield size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Disbursement Dashboard</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Loan Disbursement
            </h1>
            <p className="text-gray-600 mt-2">Release funds for sanctioned loans</p>
          </div>
          <button 
            onClick={fetchLoans} 
            className="px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl font-medium text-gray-700 hover:bg-white shadow-sm transition-all flex items-center gap-2 border border-gray-200"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Summary Cards - Only show if there are loans */}
        {!loading && loans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign size={24} className="opacity-80" />
                  <span className="text-xs opacity-80">Total Principal</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalPrincipal)}</p>
                <p className="text-xs opacity-80 mt-1">To be disbursed</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp size={24} className="opacity-80" />
                  <span className="text-xs opacity-80">Total Interest</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalInterest)}</p>
                <p className="text-xs opacity-80 mt-1">@12% p.a.</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <Award size={24} className="opacity-80" />
                  <span className="text-xs opacity-80">Total Repayment</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalRepayment)}</p>
                <p className="text-xs opacity-80 mt-1">Principal + Interest</p>
              </div>
            </div>
          </div>
        )}

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
              <Banknote size={64} className="relative text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No sanctioned loans awaiting disbursement.</p>
            <p className="text-gray-400 text-sm mt-1">Loans appear here after sanction approval.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {loans.map((loan, index) => (
              <div key={loan._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Borrower Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-lg">{loan.borrowerId.name}</p>
                          <span className="badge bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200">
                            SANCTIONED
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{loan.borrowerId.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                      {loan.sanctionedBy && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span>Sanctioned by: <strong>{loan.sanctionedBy.name}</strong></span>
                        </div>
                      )}
                      {loan.sanctionedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          <span>On: <strong>{formatDate(loan.sanctionedAt)}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount Cards */}
                  <div className="grid grid-cols-3 gap-3 min-w-[300px]">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Principal</p>
                      <p className="font-bold text-gray-800">{formatCurrency(loan.principalAmount)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 text-center border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Interest (12% SI)</p>
                      <p className="font-bold text-gray-800">{formatCurrency(loan.simpleInterest)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 text-center border border-purple-200">
                      <p className="text-xs text-gray-500 mb-1">Total Repayment</p>
                      <p className="font-bold text-purple-700">{formatCurrency(loan.totalRepayment)}</p>
                    </div>
                  </div>

                  {/* Disburse Button */}
                  <button 
                    onClick={() => setConfirmLoan(loan)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <Send size={18} /> Disburse Funds
                  </button>
                </div>

                {/* Tenure Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>Loan Tenure: <strong>{loan.tenureDays} days</strong> ({Math.floor(loan.tenureDays / 30)} months)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm Modal */}
        {confirmLoan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Send size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Disbursement</h3>
                  <p className="text-sm text-gray-500">Release funds to borrower</p>
                </div>
              </div>

              {/* Loan Details */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Borrower</span>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{confirmLoan.borrowerId.name}</p>
                    <p className="text-xs text-gray-500">{confirmLoan.borrowerId.email}</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Principal Amount</span>
                  <strong className="text-gray-900">{formatCurrency(confirmLoan.principalAmount)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tenure</span>
                  <strong className="text-gray-900">{confirmLoan.tenureDays} days</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Interest (12% SI)</span>
                  <strong className="text-gray-900">{formatCurrency(confirmLoan.simpleInterest)}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="text-sm font-semibold text-gray-700">Total Repayment Due</span>
                  <strong className="text-lg font-bold text-purple-700">{formatCurrency(confirmLoan.totalRepayment)}</strong>
                </div>
              </div>

              {/* Warning Note */}
              <div className="flex items-start gap-2 mb-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3">
                <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-orange-700 mb-0.5">⚠️ This action cannot be undone</p>
                  <p className="text-xs text-orange-600">
                    Confirming will mark this loan as <strong>Disbursed</strong> and move it to the Collection queue.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmLoan(null)} 
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDisburse} 
                  disabled={processing} 
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-medium text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Confirm Disbursement
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